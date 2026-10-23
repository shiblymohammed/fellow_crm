import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ItineraryTemplatesController } from './itinerary-templates.controller';
import { ItineraryTemplatesService } from './itinerary-templates.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ItineraryTemplatesController],
  providers: [ItineraryTemplatesService]
})
export class ItineraryTemplatesModule {}
