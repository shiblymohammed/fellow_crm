import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFollowupDto } from './dto/create-followup.dto';
import { UpdateFollowupDto } from './dto/update-followup.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FollowupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, createFollowupDto: CreateFollowupDto) {
    return this.prisma.followup.create({
      data: {
        tenantId,
        leadId: createFollowupDto.leadId,
        bookingId: createFollowupDto.bookingId,
        assignedTo: createFollowupDto.assignedTo || userId,
        dueAt: new Date(createFollowupDto.dueAt),
        type: createFollowupDto.type,
        note: createFollowupDto.note,
      },
      include: {
        lead: { select: { id: true, destination: true, customer: { select: { name: true } } } },
        assignedUser: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(tenantId: string, filter?: string, assignedTo?: string) {
    const where: any = { tenantId };
    const now = new Date();

    if (filter === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      where.dueAt = { gte: startOfDay, lt: endOfDay };
      where.status = 'pending';
    } else if (filter === 'overdue') {
      where.dueAt = { lt: now };
      where.status = 'pending';
    } else if (filter === 'upcoming') {
      where.dueAt = { gt: now };
      where.status = 'pending';
    } else if (filter === 'done') {
      where.status = 'done';
    }

    if (assignedTo) where.assignedTo = assignedTo;

    return this.prisma.followup.findMany({
      where,
      orderBy: { dueAt: 'asc' },
      include: {
        lead: { select: { id: true, destination: true, customer: { select: { name: true, phone: true } } } },
        booking: { select: { id: true, bookingNumber: true, destination: true } },
        assignedUser: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const followup = await this.prisma.followup.findFirst({
      where: { id, tenantId },
      include: {
        lead: { include: { customer: true } },
        booking: true,
        assignedUser: { select: { id: true, name: true } },
      },
    });
    if (!followup) throw new NotFoundException('Follow-up not found');
    return followup;
  }

  async update(tenantId: string, id: string, updateFollowupDto: UpdateFollowupDto) {
    const existing = await this.prisma.followup.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Follow-up not found');

    const data: any = { ...updateFollowupDto };
    if (updateFollowupDto.dueAt) data.dueAt = new Date(updateFollowupDto.dueAt);

    // If marking as done, set completedAt
    if ((updateFollowupDto as any).status === 'done') {
      data.completedAt = new Date();
    }

    return this.prisma.followup.update({
      where: { id },
      data,
      include: {
        lead: { select: { id: true, destination: true, customer: { select: { name: true } } } },
        assignedUser: { select: { id: true, name: true } },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.followup.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Follow-up not found');
    return this.prisma.followup.delete({ where: { id } });
  }
}
