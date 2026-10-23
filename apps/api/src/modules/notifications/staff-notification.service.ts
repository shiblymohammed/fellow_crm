import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappSenderService } from '../whatsapp/whatsapp-sender.service';
import { UserRole, NotificationType } from '@prisma/client';

export type StaffNotificationEvent =
  | 'new_lead'
  | 'payment_received'
  | 'payment_overdue'
  | 'visa_rejected'
  | 'visa_approved'
  | 'document_missing'
  | 'booking_confirmed';

interface NotificationContext {
  tenantId: string;
  event: StaffNotificationEvent;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  // Optional override: only notify specific user
  targetUserId?: string;
}

/** Roles that receive staff WhatsApp alerts by event */
const EVENT_RECIPIENT_ROLES: Record<StaffNotificationEvent, UserRole[]> = {
  new_lead:         [UserRole.sales, UserRole.manager, UserRole.agency_owner],
  payment_received: [UserRole.accounts, UserRole.manager, UserRole.agency_owner],
  payment_overdue:  [UserRole.accounts, UserRole.manager, UserRole.agency_owner],
  visa_rejected:    [UserRole.operations, UserRole.manager, UserRole.agency_owner],
  visa_approved:    [UserRole.operations, UserRole.manager],
  document_missing: [UserRole.operations, UserRole.sales],
  booking_confirmed:[UserRole.operations, UserRole.manager],
};

const EVENT_WA_TEMPLATES: Record<StaffNotificationEvent, (ctx: any) => string> = {
  new_lead: (ctx) =>
    `🆕 *New Lead Alert!*\n\n${ctx.body}\n\n_Fellow CRM_`,
  payment_received: (ctx) =>
    `✅ *Payment Received*\n\n${ctx.body}\n\n_Fellow CRM_`,
  payment_overdue: (ctx) =>
    `⚠️ *Overdue Payment*\n\n${ctx.body}\n\nPlease follow up immediately.\n_Fellow CRM_`,
  visa_rejected: (ctx) =>
    `❌ *Visa Rejected*\n\n${ctx.body}\n\nImmediate action required.\n_Fellow CRM_`,
  visa_approved: (ctx) =>
    `✅ *Visa Approved*\n\n${ctx.body}\n\n_Fellow CRM_`,
  document_missing: (ctx) =>
    `📋 *Missing Documents*\n\n${ctx.body}\n\n_Fellow CRM_`,
  booking_confirmed: (ctx) =>
    `🎉 *Booking Confirmed*\n\n${ctx.body}\n\n_Fellow CRM_`,
};

@Injectable()
export class StaffNotificationService {
  private readonly logger = new Logger(StaffNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly waSender: WhatsappSenderService,
  ) {}

  /**
   * Main method — creates in-app notifications AND sends WhatsApp to eligible staff.
   * Fire-and-forget safe: catches all errors internally.
   */
  async notify(ctx: NotificationContext): Promise<void> {
    try {
      await this.createInAppNotifications(ctx);
      await this.sendWhatsAppAlerts(ctx);
    } catch (err) {
      this.logger.error(`Staff notification failed for ${ctx.event}: ${err.message}`);
    }
  }

  // ─── In-App Notifications ───────────────────────────────────────────────────

  private async createInAppNotifications(ctx: NotificationContext) {
    const recipients = await this.getRecipients(ctx);
    if (!recipients.length) return;

    const notifType = this.mapEventToNotificationType(ctx.event);

    await this.prisma.notification.createMany({
      data: recipients.map((user) => ({
        tenantId: ctx.tenantId,
        userId: user.id,
        type: notifType,
        title: ctx.title,
        body: ctx.body,
        entityType: ctx.entityType,
        entityId: ctx.entityId,
      })),
      skipDuplicates: true,
    });

    this.logger.log(`📥 In-app notifications created: ${ctx.event} → ${recipients.length} users`);
  }

  // ─── WhatsApp Alerts ────────────────────────────────────────────────────────

  private async sendWhatsAppAlerts(ctx: NotificationContext) {
    // Check if tenant has a verified WA config
    const waConfig = await this.prisma.waConfig.findUnique({
      where: { tenantId: ctx.tenantId },
    });
    if (!waConfig?.waWebhookVerified) return;

    const recipients = await this.getRecipients(ctx);
    const staffWithPhone = recipients.filter((u) => u.phone);

    if (!staffWithPhone.length) return;

    const template = EVENT_WA_TEMPLATES[ctx.event];
    const message = template(ctx);

    let sent = 0;
    for (const staff of staffWithPhone) {
      try {
        await this.waSender.sendText(ctx.tenantId, staff.phone!, message);
        sent++;
      } catch (err) {
        this.logger.warn(`WA alert to ${staff.phone} failed: ${err.message}`);
      }
    }

    this.logger.log(`📲 WhatsApp staff alerts sent: ${ctx.event} → ${sent}/${staffWithPhone.length}`);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async getRecipients(ctx: NotificationContext) {
    if (ctx.targetUserId) {
      return this.prisma.user.findMany({
        where: { id: ctx.targetUserId, tenantId: ctx.tenantId, isActive: true },
        select: { id: true, phone: true },
      });
    }

    const roles = EVENT_RECIPIENT_ROLES[ctx.event] || [];
    return this.prisma.user.findMany({
      where: { tenantId: ctx.tenantId, role: { in: roles }, isActive: true },
      select: { id: true, phone: true },
    });
  }

  private mapEventToNotificationType(event: StaffNotificationEvent): NotificationType {
    const map: Record<StaffNotificationEvent, NotificationType> = {
      new_lead:         NotificationType.new_lead,
      payment_received: NotificationType.payment_received,
      payment_overdue:  NotificationType.payment_overdue,
      visa_rejected:    NotificationType.visa_update,
      visa_approved:    NotificationType.visa_update,
      document_missing: NotificationType.document_missing,
      booking_confirmed:NotificationType.booking_update,
    };
    return map[event] ?? NotificationType.system;
  }

  // ─── Convenience Helpers (called from other services) ──────────────────────

  async notifyNewLead(tenantId: string, leadId: string, customerName: string, destination?: string) {
    await this.notify({
      tenantId,
      event: 'new_lead',
      title: 'New Lead',
      body: `New lead from *${customerName}*${destination ? ` for ${destination}` : ''}`,
      entityType: 'lead',
      entityId: leadId,
    });
  }

  async notifyPaymentReceived(tenantId: string, bookingId: string, amount: number, customerName: string) {
    await this.notify({
      tenantId,
      event: 'payment_received',
      title: 'Payment Received',
      body: `₹${amount.toLocaleString('en-IN')} received from *${customerName}*`,
      entityType: 'booking',
      entityId: bookingId,
    });
  }

  async notifyPaymentOverdue(tenantId: string, bookingId: string, amount: number, customerName: string) {
    await this.notify({
      tenantId,
      event: 'payment_overdue',
      title: 'Overdue Payment',
      body: `₹${amount.toLocaleString('en-IN')} overdue from *${customerName}*`,
      entityType: 'booking',
      entityId: bookingId,
    });
  }

  async notifyVisaRejected(tenantId: string, visaId: string, customerName: string, destination: string) {
    await this.notify({
      tenantId,
      event: 'visa_rejected',
      title: 'Visa Rejected',
      body: `Visa rejected for *${customerName}* (${destination})`,
      entityType: 'visa',
      entityId: visaId,
    });
  }

  async notifyVisaApproved(tenantId: string, visaId: string, customerName: string, destination: string) {
    await this.notify({
      tenantId,
      event: 'visa_approved',
      title: 'Visa Approved',
      body: `Visa approved for *${customerName}* (${destination}) ✅`,
      entityType: 'visa',
      entityId: visaId,
    });
  }

  async notifyDocumentMissing(tenantId: string, bookingId: string, customerName: string, missingDocs: string[]) {
    await this.notify({
      tenantId,
      event: 'document_missing',
      title: 'Missing Documents',
      body: `*${customerName}* has missing docs: ${missingDocs.join(', ')}`,
      entityType: 'booking',
      entityId: bookingId,
    });
  }

  // ─── API Endpoints ─────────────────────────────────────────────────────────

  async getUserNotifications(userId: string, limit: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }
}
