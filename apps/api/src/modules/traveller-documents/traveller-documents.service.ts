import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { CreateTravellerDocumentDto } from './dto/create-traveller-document.dto';
import { UpdateTravellerDocumentDto } from './dto/update-traveller-document.dto';
import { DocumentStatus } from '@prisma/client';

@Injectable()
export class TravellerDocumentsService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  async onModuleInit() {
    // Register document-reminders queue
    this.queueService.registerQueue({
      name: 'document-reminders',
    });

    // Schedule daily check for missing documents (every 24 hours at 9 AM)
    await this.queueService.addRepeatingJob(
      'document-reminders',
      'check-missing-documents',
      {},
      {
        pattern: '0 9 * * *', // Every day at 9 AM
      },
    );

    console.log('✅ Document reminders queue initialized with daily check at 9 AM');
  }

  async create(tenantId: string, createDto: CreateTravellerDocumentDto, userId?: string) {
    // Verify traveller belongs to tenant
    const traveller = await this.prisma.traveller.findFirst({
      where: { id: createDto.travellerId, tenantId },
    });

    if (!traveller) {
      throw new NotFoundException('Traveller not found');
    }

    // Verify booking belongs to tenant
    const booking = await this.prisma.booking.findFirst({
      where: { id: createDto.bookingId, tenantId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if document already exists for this traveller and type
    const existingDoc = await this.prisma.travellerDocument.findFirst({
      where: {
        tenantId,
        travellerId: createDto.travellerId,
        docType: createDto.docType,
      },
    });

    if (existingDoc) {
      throw new BadRequestException(`Document of type ${createDto.docType} already exists for this traveller`);
    }

    return this.prisma.travellerDocument.create({
      data: {
        ...createDto,
        tenantId,
        uploadedBy: userId,
        uploadedAt: createDto.fileUrl ? new Date() : null,
        status: createDto.fileUrl ? DocumentStatus.received : DocumentStatus.pending,
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
  }

  async findAll(tenantId: string, bookingId?: string, travellerId?: string) {
    const where: any = { tenantId };

    if (bookingId) {
      where.bookingId = bookingId;
    }

    if (travellerId) {
      where.travellerId = travellerId;
    }

    return this.prisma.travellerDocument.findMany({
      where,
      include: {
        traveller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { travellerId: 'asc' },
        { docType: 'asc' },
      ],
    });
  }

  async findOne(tenantId: string, id: string) {
    const document = await this.prisma.travellerDocument.findFirst({
      where: { id, tenantId },
      include: {
        traveller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async update(tenantId: string, id: string, updateDto: UpdateTravellerDocumentDto, userId?: string) {
    const document = await this.findOne(tenantId, id);

    // If status is being changed to verified or rejected, set verifiedBy and verifiedAt
    const additionalData: any = {};
    
    if (updateDto.status === DocumentStatus.verified || updateDto.status === DocumentStatus.rejected) {
      additionalData.verifiedBy = userId;
      additionalData.verifiedAt = new Date();
    }

    // If file is being uploaded, set uploadedAt and status to received
    if (updateDto.fileUrl && !document.fileUrl) {
      additionalData.uploadedAt = new Date();
      additionalData.uploadedBy = userId;
      if (!updateDto.status) {
        additionalData.status = DocumentStatus.received;
      }
    }

    return this.prisma.travellerDocument.update({
      where: { id },
      data: {
        ...updateDto,
        ...additionalData,
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
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.travellerDocument.delete({
      where: { id },
    });
  }

  async getDocumentStatsSummary(tenantId: string, bookingId: string) {
    const documents = await this.prisma.travellerDocument.findMany({
      where: { tenantId, bookingId },
      select: { status: true },
    });

    const stats = {
      total: documents.length,
      pending: 0,
      received: 0,
      verified: 0,
      rejected: 0,
      missing: 0,
    };

    documents.forEach(doc => {
      stats[doc.status]++;
    });

    return stats;
  }

  async markAsMissing(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: DocumentStatus.missing }, undefined);
  }

  async verifyDocument(tenantId: string, id: string, userId: string) {
    return this.update(tenantId, id, { status: DocumentStatus.verified }, userId);
  }

  async rejectDocument(tenantId: string, id: string, rejectionNote: string, userId: string) {
    return this.update(tenantId, id, { 
      status: DocumentStatus.rejected, 
      rejectionNote 
    }, userId);
  }

  async scheduleDocumentReminder(tenantId: string, bookingId: string) {
    // Add job to check documents for this booking
    await this.queueService.addJob(
      'document-reminders',
      'check-pending-documents',
      { bookingId, tenantId },
      {
        delay: 3 * 24 * 60 * 60 * 1000, // 3 days delay
      },
    );
  }

  /**
   * Auto-create document placeholders for all travellers in a booking
   * Creates passport and photo requirements by default
   */
  async createDocumentPlaceholders(tenantId: string, bookingId: string) {
    // Get all travellers for this booking
    const travellers = await this.prisma.traveller.findMany({
      where: { bookingId, tenantId },
    });

    const requiredDocTypes = ['passport', 'photo'] as const;
    const createdDocs = [];

    for (const traveller of travellers) {
      for (const docType of requiredDocTypes) {
        // Check if document already exists
        const exists = await this.prisma.travellerDocument.findFirst({
          where: {
            tenantId,
            travellerId: traveller.id,
            docType: docType as any,
          },
        });

        if (!exists) {
          const doc = await this.prisma.travellerDocument.create({
            data: {
              tenantId,
              travellerId: traveller.id,
              bookingId,
              docType: docType as any,
              status: DocumentStatus.pending,
            },
          });
          createdDocs.push(doc);
        }
      }
    }

    return createdDocs;
  }
}
