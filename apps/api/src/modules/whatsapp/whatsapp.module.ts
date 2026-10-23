import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappConfigService } from './whatsapp-config.service';
import { WhatsappSenderService } from './whatsapp-sender.service';
import { WhatsappChatbotService } from './whatsapp-chatbot.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WhatsappController],
  providers: [
    WhatsappConfigService,
    WhatsappSenderService,
    WhatsappChatbotService,
  ],
  exports: [
    WhatsappConfigService,
    WhatsappSenderService,
    WhatsappChatbotService,
  ],
})
export class WhatsappModule {}
