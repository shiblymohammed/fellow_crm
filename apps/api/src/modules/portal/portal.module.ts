import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';

@Module({
  imports: [PrismaModule, WhatsappModule],
  controllers: [PortalController],
  providers: [PortalService]
})
export class PortalModule {}
