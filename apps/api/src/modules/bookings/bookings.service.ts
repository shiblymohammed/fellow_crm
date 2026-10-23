import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { TravellersService } from '../travellers/travellers.service';
import { VisaApplicationsService } from '../visa-applications/visa-applications.service';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly travellersService: TravellersService,
    private readonly visaApplicationsService: VisaApplicationsService,
  ) {}

  /**
   * Auto-generate booking number: TRV-{YEAR}-{sequence}
   */
  private async generateBookingNumber(tenantId: string): Promise<string> {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { bookingSequence: { increment: 1 } },
    });
    const year = new Date().getFullYear();
    const seq = tenant.bookingSequence.toString().padStart(4, '0');
    return `TRV-${year}-${seq}`;
  }

  /**
   * Create a new booking
   */
  async create(tenantId: string, userId: string, createBookingDto: CreateBookingDto) {
    // Verify customer belongs to tenant
    const customer = await this.prisma.customer.findFirst({
      where: { id: createBookingDto.customerId, tenantId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found in this tenant');
    }

    // Verify quotation if provided
    if (createBookingDto.quotationId) {
      const quotation = await this.prisma.quotation.findFirst({
        where: { id: createBookingDto.quotationId, tenantId },
      });
      if (!quotation) {
        throw new NotFoundException('Quotation not found in this tenant');
      }
    }

    // Verify package if provided
    if (createBookingDto.packageId) {
      const pkg = await this.prisma.package.findFirst({
        where: { id: createBookingDto.packageId, tenantId },
      });
      if (!pkg) {
        throw new NotFoundException('Package not found in this tenant');
      }
    }

    // Generate booking number
    const bookingNumber = await this.generateBookingNumber(tenantId);

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        ...createBookingDto,
        travelDate: new Date(createBookingDto.travelDate),
        returnDate: createBookingDto.returnDate ? new Date(createBookingDto.returnDate) : null,
        tenantId,
        bookingNumber,
        createdBy: userId,
        status: 'confirmed',
        balance: createBookingDto.totalAmount, // Initial balance = total amount
      },
      include: {
        customer: true,
        package: true,
        quotation: true,
      },
    });

    // Auto-triggers: create payment schedule
    await this.createDefaultPaymentSchedule(
      tenantId,
      booking.id,
      Number(booking.totalAmount),
      booking.travelDate,
    );

    // Auto-create first traveller from primary customer
    await this.createPrimaryTraveller(tenantId, booking.id, customer);

    // Auto-generate visa applications for the primary traveller
    await this.autoGenerateVisaApplications(tenantId, booking.id);

    return booking;
  }

  /**
   * Create booking from quotation (conversion)
   */
  async createFromQuotation(tenantId: string, userId: string, quotationId: string) {
    // Get quotation with all items
    const quotation = await this.prisma.quotation.findFirst({
      where: { id: quotationId, tenantId },
      include: {
        quotationItems: true,
        customer: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    if (quotation.status !== 'accepted') {
      throw new BadRequestException('Only accepted quotations can be converted to bookings');
    }

    // Check if booking already exists for this quotation
    const existingBooking = await this.prisma.booking.findFirst({
      where: { quotationId, tenantId },
    });

    if (existingBooking) {
      throw new BadRequestException('Booking already exists for this quotation');
    }

    // Create booking from quotation data
    const createDto: CreateBookingDto = {
      quotationId: quotation.id,
      customerId: quotation.customerId,
      destination: quotation.destination || 'Not specified',
      travelDate: quotation.travelDate ? quotation.travelDate.toISOString() : new Date().toISOString(),
      returnDate: quotation.returnDate ? quotation.returnDate.toISOString() : undefined,
      adults: quotation.adults,
      children: quotation.children,
      infants: quotation.infants,
      packageId: quotation.packageId || undefined,
      totalAmount: Number(quotation.totalCustomerPrice),
      assignedSales: quotation.createdBy,
      notes: quotation.notes || undefined,
    };

    const booking = await this.create(tenantId, userId, createDto);

    // Update quotation status to won
    await this.prisma.quotation.update({
      where: { id: quotationId },
      data: { status: 'accepted' },
    });

    // Note: primary traveller is already auto-created in the create() method

    return booking;
  }

  /**
   * Create default payment schedule (50% advance, 50% before travel)
   */
  private async createDefaultPaymentSchedule(
    tenantId: string,
    bookingId: string,
    totalAmount: number,
    travelDate: Date,
  ) {
    const advanceAmount = totalAmount * 0.5;
    const balanceAmount = totalAmount * 0.5;

    // Advance payment due immediately
    await this.prisma.paymentSchedule.create({
      data: {
        tenantId,
        bookingId,
        amountDue: advanceAmount,
        dueDate: new Date(), // Due now
        label: 'Advance Payment (50%)',
        status: 'pending',
      },
    });

    // Balance due 7 days before travel
    const balanceDueDate = new Date(travelDate);
    balanceDueDate.setDate(balanceDueDate.getDate() - 7);

    await this.prisma.paymentSchedule.create({
      data: {
        tenantId,
        bookingId,
        amountDue: balanceAmount,
        dueDate: balanceDueDate,
        label: 'Balance Payment (50%)',
        status: 'pending',
      },
    });
  }

  /**
   * Auto-create primary traveller from customer data
   */
  private async createPrimaryTraveller(
    tenantId: string,
    bookingId: string,
    customer: any,
  ) {
    try {
      await this.travellersService.create(tenantId, {
        bookingId,
        customerId: customer.id,
        name: customer.name,
        dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.toISOString().split('T')[0] : undefined,
        gender: customer.gender || undefined,
        type: 'adult', // Default to adult for primary customer
        passportNumber: customer.passportNumber || undefined,
        passportExpiry: customer.passportExpiry ? customer.passportExpiry.toISOString().split('T')[0] : undefined,
        placeOfBirth: customer.placeOfBirth || undefined,
        nationality: customer.nationality || undefined,
      });
    } catch (error) {
      // Log but don't fail the booking creation if traveller creation fails
      console.error('Failed to auto-create primary traveller:', error.message);
    }
  }

  /**
   * Auto-generate visa applications for all travellers in a booking
   * based on destination visa template
   */
  async autoGenerateVisaApplications(tenantId: string, bookingId: string) {
    try {
      // Get booking with destination and travellers
      const booking = await this.prisma.booking.findFirst({
        where: { id: bookingId, tenantId },
        include: {
          travellers: true,
        },
      });

      if (!booking || !booking.destination) {
        console.log('Booking not found or no destination specified');
        return;
      }

      // Check if visa template exists for destination
      const template = await this.visaApplicationsService.getDestinationTemplate(
        tenantId,
        booking.destination,
      );

      if (!template) {
        console.log(`No visa template found for destination: ${booking.destination}`);
        return;
      }

      // Create visa application for each traveller
      for (const traveller of booking.travellers) {
        // Check if visa application already exists for this traveller
        const existingVisa = await this.prisma.visaApplication.findFirst({
          where: {
            bookingId,
            travellerId: traveller.id,
            tenantId,
          },
        });

        if (existingVisa) {
          console.log(`Visa application already exists for traveller: ${traveller.name}`);
          continue;
        }

        // Create visa application from template
        await this.visaApplicationsService.createFromTemplate(
          tenantId,
          bookingId,
          traveller.id,
          booking.destination,
        );

        console.log(`✅ Auto-generated visa application for traveller: ${traveller.name}`);
      }
    } catch (error) {
      // Log but don't fail the booking flow if visa generation fails
      console.error('Failed to auto-generate visa applications:', error.message);
    }
  }

  /**
   * Get all bookings for a tenant
   */
  async findAll(tenantId: string, status?: string, search?: string) {
    const where: any = { tenantId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { bookingNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { destination: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
        createdByUser: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * Get a single booking
   */
  async findOne(tenantId: string, id: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        package: true,
        quotation: true,
        travellers: {
          orderBy: { createdAt: 'asc' },
        },
        payments: {
          orderBy: { paidAt: 'desc' },
        },
        paymentSchedules: {
          orderBy: { dueDate: 'asc' },
        },
        expenses: {
          orderBy: { expenseDate: 'desc' },
        },
        visaApplications: {
          include: {
            traveller: true,
          },
        },
        supplierBookings: {
          include: {
            supplier: true,
          },
        },
        itinerary: {
          include: {
            days: {
              orderBy: { dayNumber: 'asc' },
            },
          },
        },
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  /**
   * Update a booking
   */
  async update(tenantId: string, id: string, updateBookingDto: UpdateBookingDto) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, tenantId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify foreign keys if provided
    if (updateBookingDto.customerId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: updateBookingDto.customerId, tenantId },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found in this tenant');
      }
    }

    if (updateBookingDto.packageId) {
      const pkg = await this.prisma.package.findFirst({
        where: { id: updateBookingDto.packageId, tenantId },
      });
      if (!pkg) {
        throw new NotFoundException('Package not found in this tenant');
      }
    }

    const updateData: any = { ...updateBookingDto };

    if (updateData.travelDate) {
      updateData.travelDate = new Date(updateData.travelDate);
    }
    if (updateData.returnDate) {
      updateData.returnDate = new Date(updateData.returnDate);
    }
    if (updateData.cancelledAt) {
      updateData.cancelledAt = new Date(updateData.cancelledAt);
    }

    // If status is being set to cancelled, set cancelledAt
    if (updateData.status === 'cancelled' && !updateData.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    return this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        package: true,
        quotation: true,
      },
    });
  }

  /**
   * Delete a booking (soft delete by cancelling)
   */
  async remove(tenantId: string, id: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, tenantId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Soft delete by setting status to cancelled
    return this.prisma.booking.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: 'Deleted by user',
      },
    });
  }
}
