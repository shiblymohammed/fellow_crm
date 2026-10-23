import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { DocumentStatus } from '@prisma/client';

@Processor('document-reminders')
export class DocumentReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentReminderProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.log(`Processing document reminder job: ${job.name}`);

    switch (job.name) {
      case 'check-missing-documents':
        return this.checkMissingDocuments();
      case 'check-pending-documents':
        return this.checkPendingDocuments(job.data);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  /**
   * Check for documents that are still pending or missing for bookings
   * where travel date is approaching (within 30 days)
   */
  private async checkMissingDocuments() {
    this.logger.log('Starting missing documents check...');

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Find bookings with travel date in next 30 days
    const upcomingBookings = await this.prisma.booking.findMany({
      where: {
        travelDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(), // Travel date in future
        },
        status: {
          in: ['confirmed', 'documents_pending'],
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    this.logger.log(`Found ${upcomingBookings.length} upcoming bookings`);

    let totalMissingDocs = 0;

    for (const booking of upcomingBookings) {
      // Get all documents for this booking
      const documents = await this.prisma.travellerDocument.findMany({
        where: {
          bookingId: booking.id,
        },
        include: {
          traveller: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Count missing/pending documents
      const missingDocs = documents.filter(
        (doc) => doc.status === DocumentStatus.pending || doc.status === DocumentStatus.missing,
      );

      if (missingDocs.length > 0) {
        totalMissingDocs += missingDocs.length;
        
        this.logger.log(
          `Booking ${booking.bookingNumber}: ${missingDocs.length} missing documents for customer ${booking.customer.name}`,
        );

        // Log which travellers have missing documents
        const travellersWithMissing = new Set(missingDocs.map((doc) => doc.traveller.name));
        this.logger.log(`  Travellers: ${Array.from(travellersWithMissing).join(', ')}`);

        // TODO: When WhatsApp module is ready, send reminder to customer
        // await this.whatsappService.sendDocumentReminder(booking.customer.phone, {
        //   bookingNumber: booking.bookingNumber,
        //   destination: booking.destination,
        //   missingDocs: missingDocs.length,
        //   travelDate: booking.travelDate,
        // });

        // TODO: Send in-app notification to operations staff
        // await this.notificationService.create({
        //   userId: booking.assignedTo,
        //   type: 'documents_missing',
        //   message: `${missingDocs.length} documents missing for booking ${booking.bookingNumber}`,
        //   bookingId: booking.id,
        // });
      }
    }

    this.logger.log(`Total missing documents found: ${totalMissingDocs}`);
    return { upcomingBookings: upcomingBookings.length, totalMissingDocs };
  }

  /**
   * Check pending documents for a specific booking
   * Used when booking is created or updated
   */
  private async checkPendingDocuments(data: { bookingId: string; tenantId: string }) {
    this.logger.log(`Checking pending documents for booking: ${data.bookingId}`);

    const documents = await this.prisma.travellerDocument.findMany({
      where: {
        bookingId: data.bookingId,
        tenantId: data.tenantId,
        status: {
          in: [DocumentStatus.pending, DocumentStatus.missing],
        },
      },
      include: {
        traveller: {
          select: {
            name: true,
          },
        },
      },
    });

    this.logger.log(`Found ${documents.length} pending/missing documents`);

    // TODO: Send reminder if documents have been pending for > 3 days
    // const threeDaysAgo = new Date();
    // threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    // const overdueDocuments = documents.filter(
    //   (doc) => doc.createdAt < threeDaysAgo,
    // );

    return { total: documents.length };
  }
}
