import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappSenderService } from '../whatsapp/whatsapp-sender.service';
import { RequestOtpDto, VerifyOtpDto } from './dto/portal.dto';
import * as crypto from 'crypto';

@Injectable()
export class PortalService {
  private readonly logger = new Logger(PortalService.name);

  constructor(
    private prisma: PrismaService,
    private whatsappSender: WhatsappSenderService,
  ) {}

  async requestOtp(dto: RequestOtpDto) {
    const itinerary = await this.prisma.itinerary.findFirst({
      where: { publicSlug: dto.publicSlug },
      include: {
        booking: {
          include: { customer: true, tenant: true }
        }
      }
    });

    if (!itinerary) throw new NotFoundException('Trip not found');

    const customer = itinerary.booking.customer;
    
    // In a real app we'd standardize phone number format before comparing
    // For now we do a simple includes or endsWith check to be lenient
    const cleanDbPhone = customer.phone.replace(/\D/g, '');
    const cleanInputPhone = dto.phone.replace(/\D/g, '');
    
    if (!cleanDbPhone.endsWith(cleanInputPhone) && !cleanInputPhone.endsWith(cleanDbPhone)) {
      throw new UnauthorizedException('Phone number does not match our records for this trip');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.portalSession.create({
      data: {
        tenantId: itinerary.tenantId,
        bookingId: itinerary.bookingId,
        customerId: customer.id,
        otp,
        otpExpiresAt: expiresAt
      }
    });

    // Send via WhatsApp
    const messageText = `Hello ${customer.name}, your Fellow CRM Portal login code is: *${otp}*\n\nThis code expires in 10 minutes.`;
    
    // Log OTP to console so the developer can see it
    this.logger.log(`[DEBUG] Portal OTP for ${customer.name} (${customer.phone}): ${otp}`);
    
    await this.whatsappSender.sendText(itinerary.tenantId, customer.phone, messageText);

    return { success: true, message: 'OTP sent to your registered WhatsApp number' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const itinerary = await this.prisma.itinerary.findFirst({
      where: { publicSlug: dto.publicSlug },
      include: { booking: { include: { customer: true } } }
    });

    if (!itinerary) throw new NotFoundException('Trip not found');

    const cleanInputPhone = dto.phone.replace(/\D/g, '');
    const cleanDbPhone = itinerary.booking.customer.phone.replace(/\D/g, '');
    if (!cleanDbPhone.endsWith(cleanInputPhone) && !cleanInputPhone.endsWith(cleanDbPhone)) {
      throw new UnauthorizedException('Invalid phone number');
    }

    const session = await this.prisma.portalSession.findFirst({
      where: {
        bookingId: itinerary.bookingId,
        customerId: itinerary.booking.customer.id,
        otp: dto.otp,
        otpExpiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!session) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Generate portal token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.portalSession.update({
      where: { id: session.id },
      data: {
        otp: null, // clear OTP
        token,
        tokenExpiresAt
      }
    });

    return { token, expiresAt: tokenExpiresAt };
  }

  async getDashboardData(publicSlug: string, token: string) {
    const itinerary = await this.prisma.itinerary.findFirst({
      where: { publicSlug },
    });

    if (!itinerary) throw new NotFoundException('Trip not found');

    const session = await this.prisma.portalSession.findFirst({
      where: {
        bookingId: itinerary.bookingId,
        token,
        tokenExpiresAt: { gt: new Date() }
      }
    });

    if (!session) {
      throw new UnauthorizedException('Session expired or invalid. Please login again.');
    }

    // Fetch full booking data
    const booking = await this.prisma.booking.findUnique({
      where: { id: itinerary.bookingId },
      include: {
        customer: true,
        tenant: true,
        visaApplications: true,
        payments: { orderBy: { paidAt: 'desc' } },
        travellers: true,
      }
    });

    if (!booking) throw new NotFoundException('Booking not found');

    return {
      booking: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        destination: booking.destination,
        travelDate: booking.travelDate,
        returnDate: booking.returnDate,
        status: booking.status,
        totalAmount: booking.totalAmount,
        amountPaid: booking.amountPaid,
        balance: booking.balance,
      },
      customer: booking.customer,
      tenant: booking.tenant,
      visaApplications: booking.visaApplications,
      payments: booking.payments,
      travellers: booking.travellers,
      itineraryId: itinerary.id
    };
  }
}
