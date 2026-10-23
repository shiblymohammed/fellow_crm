import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    const slug = createTenantDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const existing = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
       throw new BadRequestException('An agency with a similar name already exists');
    }

    // Generate a secure random 8-character password
    const defaultPassword = crypto.randomBytes(4).toString('hex');
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Create the tenant
    const tenant = await this.prisma.tenant.create({
      data: {
        ...createTenantDto,
        slug,
      },
    });

    // Create the agency owner user
    await this.prisma.user.create({
      data: {
        email: createTenantDto.ownerEmail,
        passwordHash,
        name: createTenantDto.ownerName || 'Agency Owner',
        role: 'agency_owner',
        tenantId: tenant.id,
      }
    });

    return { ...tenant, defaultPassword };
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { plan: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async remove(id: string) {
    return this.prisma.tenant.delete({
      where: { id },
    });
  }
}
