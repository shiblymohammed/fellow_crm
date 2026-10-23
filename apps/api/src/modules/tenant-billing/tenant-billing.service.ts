import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTenantBillingDto } from './dto/create-tenant-billing.dto';
import { UpdateTenantBillingDto } from './dto/update-tenant-billing.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantBillingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantBillingDto: CreateTenantBillingDto) {
    const { amount, ...rest } = createTenantBillingDto;
    
    // Auto-generate invoice number if not provided
    let invoiceNumber = rest.invoiceNumber;
    if (!invoiceNumber) {
      const count = await this.prisma.tenantBilling.count({
        where: { tenantId: rest.tenantId }
      });
      invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }

    return this.prisma.tenantBilling.create({
      data: {
        ...rest,
        invoiceNumber,
        amount,
      },
    });
  }

  async findAllByTenant(tenantId: string) {
    return this.prisma.tenantBilling.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const billing = await this.prisma.tenantBilling.findUnique({
      where: { id },
    });
    if (!billing) throw new NotFoundException('Invoice not found');
    return billing;
  }

  async update(id: string, updateTenantBillingDto: UpdateTenantBillingDto) {
    const data: any = { ...updateTenantBillingDto };
    
    // If status changes to paid, record the paidAt date
    if (updateTenantBillingDto.status === 'paid') {
      data.paidAt = new Date();
    }

    return this.prisma.tenantBilling.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.tenantBilling.delete({
      where: { id },
    });
  }
}
