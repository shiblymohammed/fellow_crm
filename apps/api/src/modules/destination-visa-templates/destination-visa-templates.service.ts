import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDestinationVisaTemplateDto } from './dto/create-template.dto';
import { UpdateDestinationVisaTemplateDto } from './dto/update-template.dto';

@Injectable()
export class DestinationVisaTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDestinationVisaTemplateDto) {
    // Only platform admins can create global templates (isGlobal = true)
    // Tenant templates have tenantId set
    return this.prisma.destinationVisaTemplate.create({
      data: {
        ...dto,
        tenantId: dto.isGlobal ? null : tenantId,
        checklistItems: dto.checklistItems as any,
      },
    });
  }

  async findAll(tenantId: string, includeGlobal = true) {
    const where: any = {};

    if (includeGlobal) {
      // Return both tenant-specific and global templates
      where.OR = [
        { tenantId },
        { isGlobal: true },
      ];
    } else {
      // Only tenant-specific templates
      where.tenantId = tenantId;
    }

    return this.prisma.destinationVisaTemplate.findMany({
      where,
      orderBy: { destination: 'asc' },
    });
  }

  async findByDestination(tenantId: string, destination: string) {
    // First check for tenant-specific template
    let template = await this.prisma.destinationVisaTemplate.findFirst({
      where: { tenantId, destination },
    });

    // If not found, check for global template
    if (!template) {
      template = await this.prisma.destinationVisaTemplate.findFirst({
        where: { isGlobal: true, destination },
      });
    }

    return template;
  }

  async findOne(tenantId: string, id: string) {
    const template = await this.prisma.destinationVisaTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Check access: must be global or belong to tenant
    if (!template.isGlobal && template.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied to this template');
    }

    return template;
  }

  async update(tenantId: string, id: string, dto: UpdateDestinationVisaTemplateDto) {
    const template = await this.findOne(tenantId, id);

    // Only allow updating tenant's own templates, not global ones
    if (template.isGlobal || template.tenantId !== tenantId) {
      throw new ForbiddenException('Cannot modify this template');
    }

    return this.prisma.destinationVisaTemplate.update({
      where: { id },
      data: {
        ...dto,
        checklistItems: dto.checklistItems as any,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const template = await this.findOne(tenantId, id);

    // Only allow deleting tenant's own templates, not global ones
    if (template.isGlobal || template.tenantId !== tenantId) {
      throw new ForbiddenException('Cannot delete this template');
    }

    await this.prisma.destinationVisaTemplate.delete({
      where: { id },
    });

    return { message: 'Template deleted successfully' };
  }

  // Clone a global template to tenant-specific
  async cloneGlobalTemplate(tenantId: string, globalTemplateId: string) {
    const globalTemplate = await this.findOne(tenantId, globalTemplateId);

    if (!globalTemplate.isGlobal) {
      throw new ForbiddenException('Can only clone global templates');
    }

    return this.prisma.destinationVisaTemplate.create({
      data: {
        tenantId,
        isGlobal: false,
        destination: globalTemplate.destination,
        checklistItems: globalTemplate.checklistItems,
        notes: globalTemplate.notes,
      },
    });
  }
}
