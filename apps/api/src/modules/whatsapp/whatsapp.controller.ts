import { Controller, Get, Post, Body, UseGuards, Query, Res, Req, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { WhatsappConfigService } from './whatsapp-config.service';
import { WhatsappChatbotService } from './whatsapp-chatbot.service';
import { UpsertWaConfigDto } from './dto/upsert-wa-config.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(
    private readonly configService: WhatsappConfigService,
    private readonly chatbotService: WhatsappChatbotService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Config Endpoints (auth required) ──────────────────────────────────────

  @Post('config')
  @UseGuards(JwtAuthGuard)
  upsertConfig(@TenantId() tenantId: string, @Body() dto: UpsertWaConfigDto) {
    return this.configService.upsert(tenantId, dto);
  }

  @Get('config')
  @UseGuards(JwtAuthGuard)
  getConfig(@TenantId() tenantId: string) {
    return this.configService.getConfig(tenantId);
  }

  // ─── Webhook (no auth — Meta calls this) ───────────────────────────────────

  /** Meta webhook verification handshake */
  @Get('webhook')
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const expectedToken = this.config.get<string>('WA_WEBHOOK_VERIFY_TOKEN', 'fellow-crm-verify');
    if (mode === 'subscribe' && verifyToken === expectedToken) {
      this.logger.log('✅ WhatsApp webhook verified by Meta');
      return res.status(200).send(challenge);
    }
    this.logger.warn('❌ WA webhook verification failed — token mismatch');
    return res.status(403).json({ message: 'Forbidden' });
  }

  /** Receive all inbound WhatsApp events */
  @Post('webhook')
  async receiveWebhook(
    @Body() payload: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Always acknowledge immediately — Meta requires 200 within 5s
    res.status(200).json({ status: 'ok' });

    // Verify HMAC signature (Fix #7)
    const appSecret = this.config.get<string>('WA_APP_SECRET');
    if (appSecret) {
      const signature = (req.headers['x-hub-signature-256'] as string) || '';
      const rawBody = JSON.stringify(payload);
      const expectedSig = `sha256=${crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex')}`;
      if (signature !== expectedSig) {
        this.logger.warn('❌ WA webhook HMAC signature mismatch — ignoring payload');
        return;
      }
    }

    try {
      const entry = payload?.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      // Delivery status updates (Fix #4 — now uses injected prisma)
      if (value?.statuses?.length) {
        await this.handleStatusUpdate(value.statuses);
        return;
      }

      const phoneNumberId = value?.metadata?.phone_number_id;
      const messages = value?.messages;
      if (!messages?.length || !phoneNumberId) return;

      // Look up tenant by phone_number_id
      const waConfig = await this.configService.getConfigByPhoneNumberId(phoneNumberId);
      if (!waConfig) {
        this.logger.warn(`Unknown phone_number_id: ${phoneNumberId}`);
        return;
      }

      for (const message of messages) {
        const from: string = message.from;
        const waMessageId: string = message.id;
        let text = '';

        if (message.type === 'text') {
          text = message.text?.body || '';
        } else if (message.type === 'image') {
          text = '[Image received]';
        } else if (message.type === 'document') {
          text = '[Document received]';
        } else {
          text = `[${message.type} received]`;
        }

        await this.chatbotService.handleMessage(waConfig.tenantId, from, text, waMessageId);
      }
    } catch (error) {
      this.logger.error(`Webhook processing error: ${error.message}`, error.stack);
    }
  }

  private async handleStatusUpdate(statuses: any[]) {
    const statusMap: Record<string, string> = {
      sent: 'sent',
      delivered: 'delivered',
      read: 'read',
      failed: 'failed',
    };

    for (const status of statuses) {
      const { id: waMessageId, status: newStatus } = status;
      if (!waMessageId) continue;
      const mappedStatus = statusMap[newStatus];
      if (!mappedStatus) continue;

      try {
        await this.prisma.waMessage.updateMany({
          where: { waMessageId },
          data: { status: mappedStatus as any },
        });
      } catch (err) {
        this.logger.error(`Failed to update WA message status: ${err.message}`);
      }
    }
  }
}
