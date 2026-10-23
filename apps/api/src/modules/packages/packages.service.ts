import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePackageDto, CreatePackageItemDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { MarkupType } from '@prisma/client';

@Injectable()
export class PackagesService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateCustomerPrice(supplierCost: number, markupType: MarkupType, markupValue: number): number {
    if (markupType === 'fixed') {
      return supplierCost + markupValue;
    } else if (markupType === 'percentage') {
      return supplierCost + (supplierCost * markupValue) / 100;
    }
    return supplierCost;
  }

  async create(tenantId: string, userId: string, createPackageDto: CreatePackageDto) {
    const { items, ...packageData } = createPackageDto;

    // Calculate customer prices for all items before saving
    const itemsData = items.map((item, index) => ({
      category: item.category,
      name: item.name,
      description: item.description,
      supplierCost: item.supplierCost,
      markupType: item.markupType,
      markupValue: item.markupValue,
      customerPrice: this.calculateCustomerPrice(item.supplierCost, item.markupType, item.markupValue),
      sortOrder: item.sortOrder || index,
      tenantId,
    }));

    return this.prisma.package.create({
      data: {
        ...packageData,
        tenantId,
        createdBy: userId,
        packageItems: {
          create: itemsData,
        },
      },
      include: {
        packageItems: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async findAll(tenantId: string, search?: string) {
    const where: any = { tenantId };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { destination: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.package.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { quotations: true, bookings: true, packageItems: true } },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const pkg = await this.prisma.package.findFirst({
      where: { id, tenantId },
      include: {
        packageItems: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async update(tenantId: string, id: string, updatePackageDto: UpdatePackageDto) {
    const pkg = await this.prisma.package.findFirst({ where: { id, tenantId } });
    if (!pkg) throw new NotFoundException('Package not found');

    const { items, ...packageData } = updatePackageDto as any;

    if (items) {
      // For simplicity on updates, we delete existing items and recreate them
      // Real-world might prefer upserts, but recreating is cleaner for order/calculations in early phases
      
      const itemsData = items.map((item: CreatePackageItemDto, index: number) => ({
        category: item.category,
        name: item.name,
        description: item.description,
        supplierCost: item.supplierCost,
        markupType: item.markupType,
        markupValue: item.markupValue,
        customerPrice: this.calculateCustomerPrice(item.supplierCost, item.markupType, item.markupValue),
        sortOrder: item.sortOrder || index,
        tenantId,
      }));

      await this.prisma.packageItem.deleteMany({ where: { packageId: id, tenantId } });
      
      return this.prisma.package.update({
        where: { id },
        data: {
          ...packageData,
          packageItems: {
            create: itemsData,
          },
        },
        include: {
          packageItems: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
    }

    return this.prisma.package.update({
      where: { id },
      data: packageData,
      include: {
        packageItems: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const pkg = await this.prisma.package.findFirst({ where: { id, tenantId } });
    if (!pkg) throw new NotFoundException('Package not found');
    return this.prisma.package.delete({ where: { id } });
  }
}
