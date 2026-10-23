import { Module } from '@nestjs/common';
import { TravellerDocumentsService } from './traveller-documents.service';
import { TravellerDocumentsController } from './traveller-documents.controller';
import { DocumentReminderProcessor } from './processors/document-reminder.processor';
import { PrismaModule } from '../../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { QueueModule } from '../queue/queue.module';

// Module for managing traveller documents with file upload and verification workflow
@Module({
  imports: [PrismaModule, StorageModule, QueueModule],
  controllers: [TravellerDocumentsController],
  providers: [TravellerDocumentsService, DocumentReminderProcessor],
  exports: [TravellerDocumentsService],
})
export class TravellerDocumentsModule {}
