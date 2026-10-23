import { Module, forwardRef } from '@nestjs/common';
import { DripController } from './drip.controller';
import { DripService } from './drip.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [PrismaModule, QueueModule, WhatsappModule],
  controllers: [DripController],
  providers: [DripService],
  exports: [DripService],
})
export class DripModule {}
