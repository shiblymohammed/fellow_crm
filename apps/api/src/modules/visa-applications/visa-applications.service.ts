import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVisaApplicationDto } from './dto/create-visa-application.dto';
import { UpdateVisaApplicationDto } from './dto/update-visa-application.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';
import { VisaStatus } from '@prisma/client';
import { StaffNotificationService } from '../notifications/staff-notification.service';

@Injectable()
export class VisaApplicationsService {
  constructor(
    private prisma: PrismaService,
    private readonly staffNotifications: StaffNotificationService,
  ) {}

  async create(tenantId: string, dto: CreateVisaApplicationDto) {
    // Verify booking exists and belongs to tenant
    const booking = await this.prisma.booking.findFirst({
      where: { id: dto.bookingId, tenantId },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify traveller exists and belongs to tenant
    const traveller = await this.prisma.traveller.findFirst({
      where: { id: dto.travellerId, tenantId },
    });
    if (!traveller) {
      throw new NotFoundException('Traveller not found');
    }

    return this.prisma.visaApplication.create({
      data: {
        ...dto,
        tenantId,
        status: dto.status || VisaStatus.not_started,
      },
      include: {
        traveller: true,
        booking: true,
        visaAgent: true,
        checklistItems: true,
      },
    });
  }

  async findAll(tenantId: string, filters?: {
    bookingId?: string;
    travellerId?: string;
    status?: VisaStatus;
    destination?: string;
  }) {
    const where: any = { tenantId };

    if (filters?.bookingId) where.bookingId = filters.bookingId;
    if (filters?.travellerId) where.travellerId = filters.travellerId;
    if (filters?.status) where.status = filters.status;
    if (filters?.destination) {
      where.destination = { contains: filters.destination, mode: 'insensitive' };
    }

    return this.prisma.visaApplication.findMany({
      where,
      include: {
        traveller: true,
        booking: true,
        visaAgent: true,
        checklistItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const visa = await this.prisma.visaApplication.findFirst({
      where: { id, tenantId },
      include: {
        traveller: true,
        booking: true,
        visaAgent: true,
        checklistItems: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!visa) {
      throw new NotFoundException('Visa application not found');
    }

    return visa;
  }

  async update(tenantId: string, id: string, dto: UpdateVisaApplicationDto) {
    // Verify visa exists and belongs to tenant
    await this.findOne(tenantId, id);

    // If updating to approved status, set approvedAt
    const updateData: any = { ...dto };
    if (dto.status === VisaStatus.approved && !dto.approvedAt) {
      updateData.approvedAt = new Date();
    }

    return this.prisma.visaApplication.update({
      where: { id },
      data: updateData,
      include: {
        traveller: true,
        booking: true,
        visaAgent: true,
        checklistItems: true,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    // Verify visa exists and belongs to tenant
    await this.findOne(tenantId, id);

    await this.prisma.visaApplication.delete({
      where: { id },
    });

    return { message: 'Visa application deleted successfully' };
  }

  async updateStatus(tenantId: string, id: string, status: VisaStatus) {
    const updateData: any = { status };

    // Auto-set timestamps based on status
    if (status === VisaStatus.approved) {
      updateData.approvedAt = new Date();
    }
    if (status === VisaStatus.submitted && !updateData.submittedAt) {
      updateData.submittedAt = new Date();
    }

    const updatedVisa = await this.update(tenantId, id, updateData);

    if (status === VisaStatus.approved) {
      this.staffNotifications.notifyVisaApproved(
        tenantId, id, updatedVisa.traveller.name, updatedVisa.destination
      ).catch(() => null);
    } else if (status === VisaStatus.rejected) {
      this.staffNotifications.notifyVisaRejected(
        tenantId, id, updatedVisa.traveller.name, updatedVisa.destination
      ).catch(() => null);
    }

    return updatedVisa;
  }

  // Checklist item operations
  async createChecklistItem(tenantId: string, dto: CreateChecklistItemDto) {
    // Verify visa exists and belongs to tenant
    await this.findOne(tenantId, dto.visaId);

    return this.prisma.visaChecklistItem.create({
      data: {
        ...dto,
        tenantId,
      },
    });
  }

  async updateChecklistItem(tenantId: string, itemId: string, dto: UpdateChecklistItemDto) {
    // Verify checklist item exists and belongs to tenant
    const item = await this.prisma.visaChecklistItem.findFirst({
      where: { id: itemId, tenantId },
    });

    if (!item) {
      throw new NotFoundException('Checklist item not found');
    }

    return this.prisma.visaChecklistItem.update({
      where: { id: itemId },
      data: dto,
    });
  }

  async removeChecklistItem(tenantId: string, itemId: string) {
    // Verify checklist item exists and belongs to tenant
    const item = await this.prisma.visaChecklistItem.findFirst({
      where: { id: itemId, tenantId },
    });

    if (!item) {
      throw new NotFoundException('Checklist item not found');
    }

    await this.prisma.visaChecklistItem.delete({
      where: { id: itemId },
    });

    return { message: 'Checklist item deleted successfully' };
  }

  // Template operations
  async getDestinationTemplate(tenantId: string, destination: string) {
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

  async createFromTemplate(tenantId: string, bookingId: string, travellerId: string, destination: string) {
    const template = await this.getDestinationTemplate(tenantId, destination);

    // Create visa application
    const visa = await this.create(tenantId, {
      bookingId,
      travellerId,
      destination,
      notes: template?.notes,
    });

    // Create checklist items from template
    if (template && Array.isArray(template.checklistItems)) {
      const items = template.checklistItems as Array<{
        itemName: string;
        isRequired?: boolean;
      }>;

      await Promise.all(
        items.map((item) =>
          this.createChecklistItem(tenantId, {
            visaId: visa.id,
            travellerId,
            itemName: item.itemName,
            isRequired: item.isRequired ?? true,
          })
        )
      );
    }

    // Return visa with checklist items
    return this.findOne(tenantId, visa.id);
  }
}
