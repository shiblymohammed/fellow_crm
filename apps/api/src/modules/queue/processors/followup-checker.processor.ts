import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { WhatsappSenderService } from '../../whatsapp/whatsapp-sender.service';

/**
 * Processor for checking overdue follow-ups
 * Runs every 30 minutes via BullMQ
 */
@Injectable()
export class FollowupCheckerProcessor {
  private readonly logger = new Logger(FollowupCheckerProcessor.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly whatsappSender: WhatsappSenderService,
  ) {}

  /**
   * Check for overdue follow-ups and update their status
   */
  async process() {
    try {
      const now = new Date();
      this.logger.log('Starting overdue follow-up check...');

      // Find all pending follow-ups that are past their due date
      const overdueFollowups = await this.prismaService.followup.findMany({
        where: {
          status: 'pending',
          dueAt: {
            lt: now,
          },
        },
        include: {
          lead: {
            select: {
              id: true,
              tenantId: true,
              customer: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          assignedUser: {
            select: {
              id: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      if (overdueFollowups.length === 0) {
        this.logger.log('No overdue follow-ups found');
        return { processed: 0 };
      }

      this.logger.log(`Found ${overdueFollowups.length} overdue follow-ups`);

      // Update status to missed (since 'overdue' is not in the enum)
      const updatePromises = overdueFollowups.map(async (followup) => {
        this.logger.debug(
          `Marking follow-up as missed (overdue): ${followup.id} for customer ${followup.lead?.customer?.name || 'N/A'}`,
        );
        
        await this.prismaService.followup.update({
          where: { id: followup.id },
          data: { status: 'missed' },
        });

        // Send WhatsApp notification to the assigned user if they have a phone number and tenantId is present
        if (followup.assignedUser?.phone && followup.lead?.tenantId) {
          const customerName = followup.lead?.customer?.name || 'A customer';
          const msg = `⚠️ *Overdue Follow-up Alert*\n\nYou missed a scheduled follow-up with *${customerName}*.\nPlease check the CRM to reschedule or follow up immediately.`;
          try {
            await this.whatsappSender.sendText(followup.lead.tenantId, followup.assignedUser.phone, msg);
            this.logger.log(`Sent WhatsApp alert to ${followup.assignedUser.email} (${followup.assignedUser.phone})`);
          } catch (e) {
            this.logger.error(`Failed to send WhatsApp alert to ${followup.assignedUser.email}:`, e);
          }
        }
      });

      await Promise.all(updatePromises);

      this.logger.log(`✅ Updated ${overdueFollowups.length} follow-ups to missed status and sent alerts`);

      return {
        processed: overdueFollowups.length,
        overdueFollowups: overdueFollowups.map((f) => ({
          id: f.id,
          customerName: f.lead?.customer?.name || 'N/A',
          dueAt: f.dueAt,
          assignedTo: f.assignedUser?.email,
        })),
      };
    } catch (error) {
      this.logger.error('Error checking overdue follow-ups:', error);
      throw error;
    }
  }
}
