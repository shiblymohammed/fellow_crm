import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueService } from './queue.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FollowupCheckerProcessor } from './processors/followup-checker.processor';

import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [ConfigModule, WhatsappModule],
  providers: [QueueService, PrismaService, FollowupCheckerProcessor],
  exports: [QueueService],
})
export class QueueModule implements OnModuleInit {
  constructor(
    private readonly queueService: QueueService,
    private readonly followupCheckerProcessor: FollowupCheckerProcessor,
  ) {}

  async onModuleInit() {
    // Register followups queue with processor
    this.queueService.registerQueue({
      name: 'followups',
      processor: async (job) => {
        return await this.followupCheckerProcessor.process();
      },
    });

    // Add repeating job: check every 30 minutes (1800000 milliseconds)
    await this.queueService.addRepeatingJob(
      'followups',
      'check-overdue',
      {},
      { every: 1800000 }, // 30 minutes = 30 * 60 * 1000 = 1800000ms
    );

    console.log('✅ Followups queue initialized with 30-minute overdue check');
  }
}
