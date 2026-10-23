import { Module, forwardRef } from '@nestjs/common';
import { VisaApplicationsService } from './visa-applications.service';
import { VisaApplicationsController } from './visa-applications.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [VisaApplicationsController],
  providers: [VisaApplicationsService],
  exports: [VisaApplicationsService],
})
export class VisaApplicationsModule {}
