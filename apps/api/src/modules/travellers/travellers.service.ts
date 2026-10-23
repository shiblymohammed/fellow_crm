import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTravellerDto } from './dto/create-traveller.dto';
import { UpdateTravellerDto } from './dto/update-traveller.dto';
import { VisaApplicationsService } from '../visa-applications/visa-applications.service';

@Injectable()
export class TravellersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => VisaApplicationsService))
    private readonly visaApplicationsService: VisaApplicationsService,
  ) {}

  /**
   * Create a new traveller
   */
  async create(tenantId: string, createTravellerDto: CreateTravellerDto) {
    // Verify booking exists and belongs to tenant
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: createTravellerDto.bookingId,
        tenantId,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Convert date strings to Date objects
    const data: any = {
      tenantId,
      bookingId: createTravellerDto.bookingId,
      customerId: createTravellerDto.customerId,
      name: createTravellerDto.name,
      gender: createTravellerDto.gender,
      type: createTravellerDto.type,
      passportNumber: createTravellerDto.passportNumber,
      placeOfBirth: createTravellerDto.placeOfBirth,
      nationality: createTravellerDto.nationality,
    };

    if (createTravellerDto.dateOfBirth) {
      data.dateOfBirth = new Date(createTravellerDto.dateOfBirth);
    }

    if (createTravellerDto.passportExpiry) {
      data.passportExpiry = new Date(createTravellerDto.passportExpiry);
    }

    const traveller = await this.prisma.traveller.create({
      data,
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
          },
        },
      },
    });

    // Auto-generate visa application if destination has a template
    await this.autoGenerateVisaForTraveller(tenantId, traveller.id, booking);

    return traveller;
  }

  /**
   * Auto-generate visa application for a newly created traveller
   */
  private async autoGenerateVisaForTraveller(
    tenantId: string,
    travellerId: string,
    booking: any,
  ) {
    try {
      if (!booking.destination) {
        return;
      }

      // Check if visa template exists
      const template = await this.visaApplicationsService.getDestinationTemplate(
        tenantId,
        booking.destination,
      );

      if (!template) {
        console.log(`No visa template for destination: ${booking.destination}`);
        return;
      }

      // Check if visa application already exists
      const existingVisa = await this.prisma.visaApplication.findFirst({
        where: {
          bookingId: booking.id,
          travellerId,
          tenantId,
        },
      });

      if (existingVisa) {
        return;
      }

      // Create visa application from template
      await this.visaApplicationsService.createFromTemplate(
        tenantId,
        booking.id,
        travellerId,
        booking.destination,
      );

      console.log(`✅ Auto-generated visa application for traveller`);
    } catch (error) {
      console.error('Failed to auto-generate visa for traveller:', error.message);
    }
  }

  /**
   * Find all travellers for a booking (tenant-scoped)
   */
  async findAllByBooking(tenantId: string, bookingId: string) {
    // Verify booking belongs to tenant
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        tenantId,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.traveller.findMany({
      where: {
        tenantId,
        bookingId,
      },
      orderBy: [
        { type: 'asc' }, // adults first, then children, then infants
        { createdAt: 'asc' },
      ],
    });
  }

  /**
   * Find all travellers for a tenant
   */
  async findAll(tenantId: string) {
    return this.prisma.traveller.findMany({
      where: { tenantId },
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            customer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find one traveller by ID (tenant-scoped)
   */
  async findOne(tenantId: string, id: string) {
    const traveller = await this.prisma.traveller.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            customer: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        documents: true,
      },
    });

    if (!traveller) {
      throw new NotFoundException('Traveller not found');
    }

    return traveller;
  }

  /**
   * Update a traveller (tenant-scoped)
   */
  async update(tenantId: string, id: string, updateTravellerDto: UpdateTravellerDto) {
    // Check if traveller exists and belongs to tenant
    const existing = await this.prisma.traveller.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Traveller not found');
    }

    // Convert date strings to Date objects
    const data: any = {
      name: updateTravellerDto.name,
      gender: updateTravellerDto.gender,
      type: updateTravellerDto.type,
      passportNumber: updateTravellerDto.passportNumber,
      placeOfBirth: updateTravellerDto.placeOfBirth,
      nationality: updateTravellerDto.nationality,
      customerId: updateTravellerDto.customerId,
    };

    if (updateTravellerDto.dateOfBirth !== undefined) {
      data.dateOfBirth = updateTravellerDto.dateOfBirth
        ? new Date(updateTravellerDto.dateOfBirth)
        : null;
    }

    if (updateTravellerDto.passportExpiry !== undefined) {
      data.passportExpiry = updateTravellerDto.passportExpiry
        ? new Date(updateTravellerDto.passportExpiry)
        : null;
    }

    return this.prisma.traveller.update({
      where: { id },
      data,
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
          },
        },
      },
    });
  }

  /**
   * Delete a traveller (tenant-scoped)
   */
  async remove(tenantId: string, id: string) {
    // Check if traveller exists and belongs to tenant
    const existing = await this.prisma.traveller.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Traveller not found');
    }

    await this.prisma.traveller.delete({
      where: { id },
    });

    return { message: 'Traveller deleted successfully' };
  }
}
