import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { DripService } from '../drip/drip.service';
import { DripTrigger } from '@prisma/client';
import { StaffNotificationService } from '../notifications/staff-notification.service';
import { NotificationsGateway } from '../notifications/gateways/notifications/notifications.gateway';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => DripService)) private readonly dripService: DripService,
    private readonly staffNotifications: StaffNotificationService,
    private readonly wsGateway: NotificationsGateway,
  ) {}

  async create(tenantId: string, userId: string, createLeadDto: CreateLeadDto) {
    let customerId = createLeadDto.customerId;

    // If no customerId provided, auto-create or find the customer
    if (!customerId) {
      if (!createLeadDto.customerName || !createLeadDto.customerPhone) {
        throw new BadRequestException('Either customerId or customerName + customerPhone is required');
      }

      try {
        const customer = await this.prisma.customer.create({
          data: {
            tenantId,
            name: createLeadDto.customerName,
            phone: createLeadDto.customerPhone,
            email: createLeadDto.customerEmail || null,
            source: createLeadDto.source,
          },
        });
        customerId = customer.id;
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Customer already exists (created concurrently), fetch it
          const existingCustomer = await this.prisma.customer.findFirst({
            where: { tenantId, phone: createLeadDto.customerPhone },
          });
          if (existingCustomer) {
            customerId = existingCustomer.id;
          } else {
            throw new Error('Failed to resolve customer record during lead creation.');
          }
        } else {
          throw error;
        }
      }
    } else {
      // Security: Verify that the provided customerId actually belongs to this tenant
      const existingCustomer = await this.prisma.customer.findFirst({
        where: { id: customerId, tenantId },
      });
      if (!existingCustomer) throw new NotFoundException('Customer not found in this tenant');
    }

    // Extract only lead-specific fields
    const { customerName, customerPhone, customerEmail, ...leadData } = createLeadDto;

    const lead = await this.prisma.lead.create({
      data: {
        tenantId,
        customerId,
        destination: leadData.destination,
        travelDate: leadData.travelDate ? new Date(leadData.travelDate) : null,
        returnDate: leadData.returnDate ? new Date(leadData.returnDate) : null,
        adults: leadData.adults || 1,
        children: leadData.children || 0,
        infants: leadData.infants || 0,
        budgetPerPerson: leadData.budgetPerPerson,
        preferredHotels: leadData.preferredHotels,
        specialRequests: leadData.specialRequests,
        source: leadData.source,
        status: leadData.status || 'new',
        assignedTo: leadData.assignedTo || userId, // Fallback to creator if not assigned
      },
      include: {
        customer: true,
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });

    // Auto-enroll lead in any active 'new_lead' drip sequences (fire-and-forget)
    this.dripService.enrollLead(tenantId, lead.id, customerId, DripTrigger.new_lead).catch(() => null);

    // Notify staff of new lead (fire-and-forget)
    this.staffNotifications.notifyNewLead(
      tenantId, lead.id,
      lead.customer.name,
      lead.destination || undefined,
    ).catch(() => null);

    // WebSocket real-time broadcast
    this.wsGateway.sendNotification(tenantId, 'new_lead', {
      id: lead.id,
      name: lead.customer.name,
      destination: lead.destination
    });

    return lead;
  }

  async findAll(tenantId: string, status?: string, assignedTo?: string, search?: string) {
    const where: any = { tenantId };

    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;
    if (search) {
      where.OR = [
        { destination: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    return this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        assignedUser: { select: { id: true, name: true } },
        _count: { select: { followups: true, quotations: true } },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        assignedUser: { select: { id: true, name: true, email: true } },
        followups: { orderBy: { dueAt: 'desc' }, take: 10 },
        leadNotes: { orderBy: { createdAt: 'desc' }, take: 20 },
        quotations: { orderBy: { createdAt: 'desc' }, take: 5 },
        _count: { select: { followups: true, quotations: true } },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async update(tenantId: string, id: string, updateLeadDto: UpdateLeadDto) {
    const existing = await this.prisma.lead.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Lead not found');

    return this.prisma.lead.update({
      where: { id },
      data: updateLeadDto,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        assignedUser: { select: { id: true, name: true } },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.lead.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Lead not found');

    return this.prisma.lead.delete({ where: { id } });
  }
}
