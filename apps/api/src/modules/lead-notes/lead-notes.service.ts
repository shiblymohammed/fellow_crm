import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeadNoteDto } from './dto/create-lead-note.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeadNotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, createLeadNoteDto: CreateLeadNoteDto) {
    // Verify lead belongs to tenant
    const lead = await this.prisma.lead.findFirst({
      where: { id: createLeadNoteDto.leadId, tenantId },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.leadNote.create({
      data: {
        tenantId,
        leadId: createLeadNoteDto.leadId,
        createdBy: userId,
        type: createLeadNoteDto.type,
        content: createLeadNoteDto.content,
      },
    });
  }

  async findAllByLead(tenantId: string, leadId: string) {
    // Verify lead belongs to tenant
    const lead = await this.prisma.lead.findFirst({ where: { id: leadId, tenantId } });
    if (!lead) throw new NotFoundException('Lead not found');

    return this.prisma.leadNote.findMany({
      where: { leadId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(tenantId: string, id: string, userId: string, role: string) {
    const existing = await this.prisma.leadNote.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Note not found');

    if (role !== 'agency_owner' && role !== 'manager' && existing.createdBy !== userId) {
      throw new Error('You do not have permission to delete this note.');
    }

    return this.prisma.leadNote.delete({ where: { id } });
  }
}
