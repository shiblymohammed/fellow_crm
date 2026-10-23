import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertWaConfigDto } from './dto/upsert-wa-config.dto';
import * as crypto from 'crypto';

@Injectable()
export class WhatsappConfigService {
  private readonly logger = new Logger(WhatsappConfigService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private encrypt(text: string): string {
    const key = this.config.get<string>('ENCRYPTION_KEY', 'fallback-key-32-chars-exactly!!');
    const iv = crypto.randomBytes(16);
    const keyBuffer = Buffer.from(key.padEnd(32).slice(0, 32));
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  private decrypt(text: string): string {
    const key = this.config.get<string>('ENCRYPTION_KEY', 'fallback-key-32-chars-exactly!!');
    const [ivHex, encryptedHex] = text.split(':');
    const keyBuffer = Buffer.from(key.padEnd(32).slice(0, 32));
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, Buffer.from(ivHex, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]);
    return decrypted.toString('utf8');
  }

  async upsert(tenantId: string, dto: UpsertWaConfigDto) {
    const encryptedToken = this.encrypt(dto.waAccessToken);
    const encryptedBspKey = dto.bspApiKey ? this.encrypt(dto.bspApiKey) : null;

    const config = await this.prisma.waConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        waPhoneNumberId: dto.waPhoneNumberId,
        waAccessToken: encryptedToken,
        waBusinessAccountId: dto.waBusinessAccountId,
        bspProvider: dto.bspProvider,
        bspApiKey: encryptedBspKey,
      },
      update: {
        waPhoneNumberId: dto.waPhoneNumberId,
        waAccessToken: encryptedToken,
        waBusinessAccountId: dto.waBusinessAccountId,
        bspProvider: dto.bspProvider,
        bspApiKey: encryptedBspKey,
        waWebhookVerified: false, // reset on token change
      },
    });

    return { id: config.id, waPhoneNumberId: config.waPhoneNumberId, waWebhookVerified: config.waWebhookVerified, bspProvider: config.bspProvider, connectedAt: config.connectedAt };
  }

  async getConfig(tenantId: string) {
    const config = await this.prisma.waConfig.findUnique({ where: { tenantId } });
    if (!config) return null;
    return {
      id: config.id,
      waPhoneNumberId: config.waPhoneNumberId,
      waBusinessAccountId: config.waBusinessAccountId,
      waWebhookVerified: config.waWebhookVerified,
      bspProvider: config.bspProvider,
      connectedAt: config.connectedAt,
      updatedAt: config.updatedAt,
      // Never return the raw token
    };
  }

  /** Used internally by webhook service to get the decrypted token */
  async getDecryptedToken(tenantId: string): Promise<string | null> {
    const config = await this.prisma.waConfig.findUnique({ where: { tenantId } });
    if (!config) return null;
    try {
      return this.decrypt(config.waAccessToken);
    } catch {
      this.logger.warn(`Failed to decrypt WA token for tenant ${tenantId}`);
      return null;
    }
  }

  async getConfigByPhoneNumberId(phoneNumberId: string) {
    return this.prisma.waConfig.findFirst({
      where: { waPhoneNumberId: phoneNumberId },
    });
  }

  async markWebhookVerified(tenantId: string) {
    return this.prisma.waConfig.update({
      where: { tenantId },
      data: { waWebhookVerified: true, connectedAt: new Date() },
    });
  }
}
