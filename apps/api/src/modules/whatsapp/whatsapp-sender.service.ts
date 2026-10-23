import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappConfigService } from './whatsapp-config.service';

export interface OutboundMessage {
  to: string;
  type: 'text' | 'template' | 'document';
  text?: string;
  template?: {
    name: string;
    language: string;
    components?: any[];
  };
  document?: {
    link: string;
    filename?: string;
    caption?: string;
  };
}

@Injectable()
export class WhatsappSenderService {
  private readonly logger = new Logger(WhatsappSenderService.name);

  constructor(
    private readonly configService: WhatsappConfigService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async sendMessage(tenantId: string, message: OutboundMessage, conversationId?: string): Promise<string | null> {
    const waConfig = await this.prisma.waConfig.findUnique({ where: { tenantId } });
    if (!waConfig) {
      this.logger.warn(`No WA config for tenant ${tenantId}`);
      return null;
    }

    const token = await this.configService.getDecryptedToken(tenantId);
    if (!token) return null;

    const body = this.buildMessageBody(waConfig.waPhoneNumberId, message);

    try {
      const url = `https://graph.facebook.com/v21.0/${waConfig.waPhoneNumberId}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const json: any = await res.json();
      if (!res.ok) {
        this.logger.error(`WA send failed: ${JSON.stringify(json)}`);
        return null;
      }

      const waMessageId = json.messages?.[0]?.id;
      this.logger.log(`✅ WA message sent to ${message.to}: ${waMessageId}`);

      // Persist outbound message if we have a conversation
      if (conversationId) {
        await this.prisma.waMessage.create({
          data: {
            tenantId,
            conversationId,
            direction: 'outbound',
            content: message.text || message.document?.link || `template:${message.template?.name}`,
            messageType: message.type,
            waMessageId,
            status: 'sent',
          },
        });
      }

      return waMessageId;
    } catch (error) {
      this.logger.error(`WA send exception: ${error.message}`);
      return null;
    }
  }

  async sendText(tenantId: string, to: string, text: string, conversationId?: string) {
    return this.sendMessage(tenantId, { to, type: 'text', text }, conversationId);
  }

  async sendDocument(tenantId: string, to: string, document: NonNullable<OutboundMessage['document']>, conversationId?: string) {
    return this.sendMessage(tenantId, { to, type: 'document', document }, conversationId);
  }

  private buildMessageBody(phoneNumberId: string, message: OutboundMessage) {
    const base: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: message.to,
    };

    if (message.type === 'text') {
      base.type = 'text';
      base.text = { body: message.text, preview_url: false };
    } else if (message.type === 'template') {
      base.type = 'template';
      base.template = {
        name: message.template!.name,
        language: { code: message.template!.language },
        components: message.template!.components || [],
      };
    } else if (message.type === 'document') {
      base.type = 'document';
      base.document = {
        link: message.document!.link,
        filename: message.document!.filename,
        caption: message.document!.caption,
      };
    }

    return base;
  }
}
