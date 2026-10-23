import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import * as handlebars from 'handlebars';

@Injectable()
export class MarketplaceTemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService
  ) {}

  // ==========================================
  // SUPER ADMIN METHODS (CRUD Templates)
  // ==========================================
  
  async createTemplate(data: any) {
    return this.prisma.marketplaceTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        htmlTemplate: data.htmlTemplate,
        fieldSchema: data.fieldSchema || [],
        isPremium: data.isPremium || false,
        price: data.price || 0,
        isPublished: data.isPublished || false,
        previewImageUrl: data.previewImageUrl
      }
    });
  }

  async updateTemplate(id: string, data: any) {
    return this.prisma.marketplaceTemplate.update({
      where: { id },
      data
    });
  }

  async deleteTemplate(id: string) {
    return this.prisma.marketplaceTemplate.delete({ where: { id } });
  }

  // ==========================================
  // AGENCY METHODS (Marketplace & Install)
  // ==========================================

  async getMarketplace(tenantId?: string) {
    // Return all published templates
    const templates = await this.prisma.marketplaceTemplate.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' }
    });

    if (!tenantId) return templates;

    // Check which ones are already installed by this tenant
    const installed = await this.prisma.tenantInstalledTemplate.findMany({
      where: { tenantId },
      select: { templateId: true }
    });
    
    const installedIds = new Set(installed.map(i => i.templateId));
    
    return templates.map(t => ({
      ...t,
      isInstalled: installedIds.has(t.id)
    }));
  }

  async installTemplate(tenantId: string, templateId: string) {
    const template = await this.prisma.marketplaceTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new NotFoundException('Template not found');

    // Prevent duplicate installation
    const existing = await this.prisma.tenantInstalledTemplate.findFirst({
      where: { tenantId, templateId }
    });
    if (existing) throw new BadRequestException('Template is already installed');

    // Premium logic check would go here later (billing)

    return this.prisma.tenantInstalledTemplate.create({
      data: {
        tenantId,
        templateId
      }
    });
  }

  async getInstalledTemplates(tenantId: string, category?: string) {
    return this.prisma.tenantInstalledTemplate.findMany({
      where: {
        tenantId,
        ...(category ? { template: { category } } : {})
      },
      include: {
        template: true
      }
    });
  }

  // ==========================================
  // GENERATION ENGINE (Handlebars -> Puppeteer)
  // ==========================================

  async generatePdfFromTemplate(tenantId: string, installedTemplateId: string, payload: any) {
    const installed = await this.prisma.tenantInstalledTemplate.findUnique({
      where: { id: installedTemplateId, tenantId },
      include: { template: true }
    });

    if (!installed) throw new NotFoundException('Installed template not found');

    const templateHtml = installed.template.htmlTemplate;
    
    try {
      // Register Handlebars helpers
      handlebars.registerHelper('zeroPad', (num: number) => String(num).padStart(2, '0'));
      handlebars.registerHelper('eq', (a: any, b: any) => a === b);
      handlebars.registerHelper('gt', (a: number, b: number) => a > b);

      // Compile template with Handlebars
      const compiled = handlebars.compile(templateHtml);
      const finalHtml = compiled(payload);

      // Generate PDF
      const pdfBuffer = await this.pdfService.generatePdfFromHtml(finalHtml);
      return pdfBuffer;
    } catch (err) {
      throw new BadRequestException('Failed to compile template HTML or generate PDF: ' + (err as Error).message);
    }
  }
}
