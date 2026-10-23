import { Module, forwardRef } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { LeadWebhooksController } from './lead-webhooks.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { DripModule } from '../drip/drip.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [forwardRef(() => DripModule), NotificationsModule],
  controllers: [LeadsController, LeadWebhooksController],
  providers: [LeadsService, PrismaService],
  exports: [LeadsService],
})
export class LeadsModule {}
