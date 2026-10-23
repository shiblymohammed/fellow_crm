import { Module } from '@nestjs/common';
import { StaffNotificationService } from './staff-notification.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { NotificationsGateway } from './gateways/notifications/notifications.gateway';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [PrismaModule, WhatsappModule],
  providers: [StaffNotificationService, NotificationsGateway],
  exports: [StaffNotificationService, NotificationsGateway],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
