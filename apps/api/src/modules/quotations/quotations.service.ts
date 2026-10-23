import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuotationDto, CreateQuotationItemDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class QuotationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly storageService: StorageService,
  ) {}

  private async generateQuotationNumber(tenantId: string): Promise<string> {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { quotationSequence: { increment: 1 } },
    });
    const year = new Date().getFullYear();
    const seq = tenant.quotationSequence.toString().padStart(4, '0');
    return `QT-${year}-${seq}`;
  }

  async create(tenantId: string, userId: string, createQuotationDto: CreateQuotationDto) {
    const { items, ...quotationData } = createQuotationDto;

    // Security: Verify that foreign keys actually belong to this tenant
    const customer = await this.prisma.customer.findFirst({ where: { id: quotationData.customerId, tenantId } });
    if (!customer) throw new NotFoundException('Customer not found in this tenant');

    if (quotationData.leadId) {
      const lead = await this.prisma.lead.findFirst({ where: { id: quotationData.leadId, tenantId } });
      if (!lead) throw new NotFoundException('Lead not found in this tenant');
    }

    if (quotationData.packageId) {
      const pkg = await this.prisma.package.findFirst({ where: { id: quotationData.packageId, tenantId } });
      if (!pkg) throw new NotFoundException('Package not found in this tenant');
    }

    const quotationNumber = await this.generateQuotationNumber(tenantId);

    // Calculate totals
    let totalSupplierCost = 0;
    let totalCustomerPrice = 0;

    const itemsData = items.map((item, index) => {
      totalSupplierCost += item.supplierCost;
      totalCustomerPrice += item.customerPrice;

      return {
        category: item.category,
        name: item.name,
        description: item.description,
        supplierCost: item.supplierCost,
        customerPrice: item.customerPrice,
        sortOrder: item.sortOrder || index,
        tenantId,
      };
    });

    const grossProfit = totalCustomerPrice - totalSupplierCost;

    return this.prisma.quotation.create({
      data: {
        ...quotationData,
        travelDate: quotationData.travelDate ? new Date(quotationData.travelDate) : null,
        returnDate: quotationData.returnDate ? new Date(quotationData.returnDate) : null,
        validUntil: quotationData.validUntil ? new Date(quotationData.validUntil) : null,
        tenantId,
        quotationNumber,
        createdBy: userId,
        totalSupplierCost,
        totalCustomerPrice,
        grossProfit,
        quotationItems: {
          create: itemsData,
        },
      },
      include: {
        quotationItems: {
          orderBy: { sortOrder: 'asc' },
        },
        customer: true,
      },
    });
  }

  async findAll(tenantId: string, status?: string, search?: string) {
    const where: any = { tenantId };
    
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { quotationNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { destination: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.quotation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        createdByUser: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, tenantId },
      include: {
        quotationItems: {
          orderBy: { sortOrder: 'asc' },
        },
        customer: true,
        lead: true,
        package: true,
        createdByUser: { select: { id: true, name: true } },
      },
    });
    
    if (!quotation) throw new NotFoundException('Quotation not found');
    return quotation;
  }

  async findOnePublic(id: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id },
      include: {
        quotationItems: {
          orderBy: { sortOrder: 'asc' },
        },
        customer: true,
        tenant: { select: { name: true, logoUrl: true, primaryColor: true } },
      },
    });
    
    if (!quotation) throw new NotFoundException('Quotation not found');
    return quotation;
  }

  async update(tenantId: string, id: string, updateQuotationDto: UpdateQuotationDto) {
    const quotation = await this.prisma.quotation.findFirst({ where: { id, tenantId } });
    if (!quotation) throw new NotFoundException('Quotation not found');

    const { items, ...quotationData } = updateQuotationDto as any;
    
    // Security: Verify that foreign keys actually belong to this tenant
    if (quotationData.customerId) {
      const customer = await this.prisma.customer.findFirst({ where: { id: quotationData.customerId, tenantId } });
      if (!customer) throw new NotFoundException('Customer not found in this tenant');
    }
    if (quotationData.leadId) {
      const lead = await this.prisma.lead.findFirst({ where: { id: quotationData.leadId, tenantId } });
      if (!lead) throw new NotFoundException('Lead not found in this tenant');
    }
    if (quotationData.packageId) {
      const pkg = await this.prisma.package.findFirst({ where: { id: quotationData.packageId, tenantId } });
      if (!pkg) throw new NotFoundException('Package not found in this tenant');
    }

    const updateData: any = { ...quotationData };
    if (updateData.travelDate) updateData.travelDate = new Date(updateData.travelDate);
    if (updateData.returnDate) updateData.returnDate = new Date(updateData.returnDate);
    if (updateData.validUntil) updateData.validUntil = new Date(updateData.validUntil);

    if (items) {
      let totalSupplierCost = 0;
      let totalCustomerPrice = 0;

      const itemsData = items.map((item: CreateQuotationItemDto, index: number) => {
        totalSupplierCost += item.supplierCost;
        totalCustomerPrice += item.customerPrice;

        return {
          category: item.category,
          name: item.name,
          description: item.description,
          supplierCost: item.supplierCost,
          customerPrice: item.customerPrice,
          sortOrder: item.sortOrder || index,
          tenantId,
        };
      });

      updateData.totalSupplierCost = totalSupplierCost;
      updateData.totalCustomerPrice = totalCustomerPrice;
      updateData.grossProfit = totalCustomerPrice - totalSupplierCost;

      // Replace all items
      await this.prisma.quotationItem.deleteMany({ where: { quotationId: id, tenantId } });
      
      return this.prisma.quotation.update({
        where: { id },
        data: {
          ...updateData,
          quotationItems: {
            create: itemsData,
          },
        },
        include: {
          quotationItems: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
    }

    return this.prisma.quotation.update({
      where: { id },
      data: updateData,
      include: {
        quotationItems: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const quotation = await this.prisma.quotation.findFirst({ where: { id, tenantId } });
    if (!quotation) throw new NotFoundException('Quotation not found');
    return this.prisma.quotation.delete({ where: { id } });
  }

  async getPdf(tenantId: string, id: string): Promise<string> {
    const quotation = await this.prisma.quotation.findFirst({ where: { id, tenantId } });
    if (!quotation) throw new NotFoundException('Quotation not found');

    if (quotation.pdfUrl) {
      return quotation.pdfUrl;
    }

    // Generate new PDF
    const urlPath = `/portal/quotations/${id}/pdf`;
    const pdfBuffer = await this.pdfService.generatePdf(urlPath);
    
    const fileName = `quotation_${quotation.quotationNumber}_${Date.now()}.pdf`;
    const pdfUrl = await this.storageService.uploadFile(fileName, pdfBuffer, 'application/pdf');

    // Save URL to database
    await this.prisma.quotation.update({
      where: { id },
      data: { pdfUrl },
    });

    return pdfUrl;
  }
}
