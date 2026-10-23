import { Module } from '@nestjs/common';
import { DestinationVisaTemplatesService } from './destination-visa-templates.service';
import { DestinationVisaTemplatesController } from './destination-visa-templates.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DestinationVisaTemplatesController],
  providers: [DestinationVisaTemplatesService],
  exports: [DestinationVisaTemplatesService],
})
export class DestinationVisaTemplatesModule {}
