import { Module } from '@nestjs/common';
import { LeadNotesService } from './lead-notes.service';
import { LeadNotesController } from './lead-notes.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [LeadNotesController],
  providers: [LeadNotesService, PrismaService],
  exports: [LeadNotesService],
})
export class LeadNotesModule {}
