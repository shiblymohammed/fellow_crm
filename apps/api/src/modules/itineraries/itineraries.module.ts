import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { PublicItinerariesController } from './public-itineraries.controller';
import { ItinerariesController } from './itineraries.controller';
import { ItinerariesService } from './itineraries.service';

@Module({
  imports: [PrismaModule, AuthModule, StorageModule, WhatsappModule],
  controllers: [ItinerariesController, PublicItinerariesController],
  providers: [ItinerariesService]
})
export class ItinerariesModule {}
