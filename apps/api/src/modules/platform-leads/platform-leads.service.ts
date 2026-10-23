import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlatformLeadDto } from './dto/create-platform-lead.dto';
import { UpdatePlatformLeadDto } from './dto/update-platform-lead.dto';

@Injectable()
export class PlatformLeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPlatformLeadDto: CreatePlatformLeadDto) {
    return this.prisma.platformLead.create({
      data: createPlatformLeadDto,
    });
  }

  async findAll() {
    return this.prisma.platformLead.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const lead = await this.prisma.platformLead.findUnique({
      where: { id },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async update(id: string, updatePlatformLeadDto: UpdatePlatformLeadDto) {
    return this.prisma.platformLead.update({
      where: { id },
      data: updatePlatformLeadDto,
    });
  }

  async remove(id: string) {
    return this.prisma.platformLead.delete({
      where: { id },
    });
  }
}
