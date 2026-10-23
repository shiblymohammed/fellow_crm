import { Module } from '@nestjs/common';
import { MarketplaceTemplatesController } from './marketplace-templates.controller';
import { MarketplaceTemplatesService } from './marketplace-templates.service';
import { PdfModule } from '../pdf/pdf.module';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [PdfModule],
  controllers: [MarketplaceTemplatesController],
  providers: [MarketplaceTemplatesService, PrismaService]
})
export class MarketplaceTemplatesModule {}
