import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { WhatsappSenderService } from '../whatsapp/whatsapp-sender.service';
import { CreateDripSequenceDto } from './dto/create-drip-sequence.dto';
import { CreateDripStepDto } from './dto/create-drip-step.dto';
import { DripTrigger, DripJobStatus, LeadStatus } from '@prisma/client';

const DRIP_QUEUE = 'drip-messages';

@Injectable()
export class DripService implements OnModuleInit {
  private readonly logger = new Logger(DripService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: QueueService,
    private readonly waSender: WhatsappSenderService,
  ) {}

  onModuleInit() {
    // Register the drip queue with its processor
    this.queue.registerQueue({
      name: DRIP_QUEUE,
      processor: async (job) => {
        await this.processDripJob(job.data);
      },
    });
    this.logger.log('✅ Drip message queue initialized');
  }

  // ─── Sequence CRUD ─────────────────────────────────────────────────────────

  async createSequence(tenantId: string, dto: CreateDripSequenceDto) {
    return this.prisma.dripSequence.create({
      data: {
        tenantId,
        name: dto.name,
        triggerStage: dto.triggerStage,
        isActive: dto.isActive ?? true,
      },
      include: { steps: true },
    });
  }

  async listSequences(tenantId: string) {
    return this.prisma.dripSequence.findMany({
      where: { tenantId },
      include: { steps: { orderBy: { stepNumber: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSequence(tenantId: string, sequenceId: string) {
    const seq = await this.prisma.dripSequence.findFirst({
      where: { id: sequenceId, tenantId },
      include: { steps: { orderBy: { stepNumber: 'asc' } } },
    });
    if (!seq) throw new NotFoundException('Drip sequence not found');
    return seq;
  }

  async toggleSequence(tenantId: string, sequenceId: string, isActive: boolean) {
    const seq = await this.prisma.dripSequence.findFirst({ where: { id: sequenceId, tenantId } });
    if (!seq) throw new NotFoundException('Drip sequence not found');
    return this.prisma.dripSequence.update({
      where: { id: sequenceId },
      data: { isActive },
      include: { steps: true },
    });
  }

  async deleteSequence(tenantId: string, sequenceId: string) {
    const seq = await this.prisma.dripSequence.findFirst({ where: { id: sequenceId, tenantId } });
    if (!seq) throw new NotFoundException('Drip sequence not found');
    // Cancel all pending jobs for this sequence
    await this.cancelJobsForSequence(tenantId, sequenceId);
    return this.prisma.dripSequence.delete({ where: { id: sequenceId } });
  }

  // ─── Step CRUD ─────────────────────────────────────────────────────────────

  async addStep(tenantId: string, sequenceId: string, dto: CreateDripStepDto) {
    const seq = await this.prisma.dripSequence.findFirst({ where: { id: sequenceId, tenantId } });
    if (!seq) throw new NotFoundException('Drip sequence not found');
    return this.prisma.dripSequenceStep.create({
      data: {
        tenantId,
        sequenceId,
        stepNumber: dto.stepNumber,
        delayDays: dto.delayDays,
        messageTemplate: dto.messageTemplate,
        stepType: dto.stepType,
      },
    });
  }

  async updateStep(tenantId: string, stepId: string, dto: Partial<CreateDripStepDto>) {
    const step = await this.prisma.dripSequenceStep.findFirst({ where: { id: stepId, tenantId } });
    if (!step) throw new NotFoundException('Step not found');
    return this.prisma.dripSequenceStep.update({ where: { id: stepId }, data: dto });
  }

  async deleteStep(tenantId: string, stepId: string) {
    const step = await this.prisma.dripSequenceStep.findFirst({ where: { id: stepId, tenantId } });
    if (!step) throw new NotFoundException('Step not found');
    return this.prisma.dripSequenceStep.delete({ where: { id: stepId } });
  }

  // ─── BullMQ Job Scheduling ─────────────────────────────────────────────────

  /**
   * Called when a lead hits a drip trigger (e.g., new_lead, quotation_sent).
   * Finds all active sequences for that trigger and schedules a delayed job per step.
   */
  async enrollLead(tenantId: string, leadId: string, customerId: string, trigger: DripTrigger) {
    const sequences = await this.prisma.dripSequence.findMany({
      where: { tenantId, triggerStage: trigger, isActive: true },
      include: { steps: { orderBy: { stepNumber: 'asc' } } },
    });

    if (!sequences.length) return;

    for (const seq of sequences) {
      for (const step of seq.steps) {
        const delayMs = step.delayDays * 24 * 60 * 60 * 1000;
        const scheduledAt = new Date(Date.now() + delayMs);

        // Create DB record
        const dripJob = await this.prisma.dripJob.create({
          data: {
            tenantId,
            sequenceId: seq.id,
            stepId: step.id,
            leadId,
            customerId,
            scheduledAt,
            status: DripJobStatus.scheduled,
          },
        });

        // Schedule BullMQ delayed job
        const bullJob = await this.queue.addJob(
          DRIP_QUEUE,
          'send-drip',
          { dripJobId: dripJob.id, tenantId },
          { delay: delayMs, jobId: `drip-${dripJob.id}` },
        );

        // Store bullmqJobId for cancellation
        await this.prisma.dripJob.update({
          where: { id: dripJob.id },
          data: { bullmqJobId: bullJob.id },
        });

        this.logger.log(`📅 Drip job scheduled: step ${step.stepNumber} for lead ${leadId} in ${step.delayDays}d`);
      }
    }
  }

  /**
   * Cancel all pending drip jobs for a lead (called when customer replies/converts).
   */
  async cancelJobsForLead(tenantId: string, leadId: string) {
    const pendingJobs = await this.prisma.dripJob.findMany({
      where: { tenantId, leadId, status: DripJobStatus.scheduled },
    });

    const bullQueue = this.queue.getQueue(DRIP_QUEUE);

    for (const job of pendingJobs) {
      try {
        if (job.bullmqJobId && bullQueue) {
          const bullJob = await bullQueue.getJob(job.bullmqJobId);
          if (bullJob) await bullJob.remove();
        }
      } catch (err) {
        this.logger.warn(`Could not remove BullMQ job ${job.bullmqJobId}: ${err.message}`);
      }

      await this.prisma.dripJob.update({
        where: { id: job.id },
        data: { status: DripJobStatus.cancelled },
      });
    }

    this.logger.log(`🚫 Cancelled ${pendingJobs.length} drip jobs for lead ${leadId}`);
  }

  private async cancelJobsForSequence(tenantId: string, sequenceId: string) {
    const pendingJobs = await this.prisma.dripJob.findMany({
      where: { tenantId, sequenceId, status: DripJobStatus.scheduled },
    });

    const bullQueue = this.queue.getQueue(DRIP_QUEUE);

    for (const job of pendingJobs) {
      try {
        if (job.bullmqJobId && bullQueue) {
          const bullJob = await bullQueue.getJob(job.bullmqJobId);
          if (bullJob) await bullJob.remove();
        }
      } catch (err) {
        this.logger.warn(`Could not remove BullMQ job ${job.bullmqJobId}: ${err.message}`);
      }
      await this.prisma.dripJob.update({
        where: { id: job.id },
        data: { status: DripJobStatus.cancelled },
      });
    }
  }

  // ─── Job Processor ─────────────────────────────────────────────────────────

  private async processDripJob(data: { dripJobId: string; tenantId: string }) {
    const { dripJobId, tenantId } = data;

    const job = await this.prisma.dripJob.findFirst({
      where: { id: dripJobId, tenantId },
      include: {
        step: true,
        lead: { include: { customer: true } },
      },
    });

    if (!job) {
      this.logger.warn(`Drip job not found: ${dripJobId}`);
      return;
    }

    // Skip if already cancelled or sent
    if (job.status !== DripJobStatus.scheduled) {
      this.logger.log(`Drip job ${dripJobId} is ${job.status} — skipping`);
      return;
    }

    const phone = job.lead.customer.whatsapp || job.lead.customer.phone;
    const message = this.interpolateTemplate(job.step.messageTemplate, {
      customerName: job.lead.customer.name,
      destination: job.lead.destination || '',
    });

    try {
      if (job.step.stepType === 'whatsapp') {
        await this.waSender.sendText(tenantId, phone, message);
      }
      // email type: extend here when mail module is integrated

      await this.prisma.dripJob.update({
        where: { id: dripJobId },
        data: { status: DripJobStatus.sent, sentAt: new Date() },
      });

      // Check if this was the last step — mark lead as cold
      await this.maybeMarkLeadCold(tenantId, job.leadId, job.sequenceId);

      this.logger.log(`✅ Drip message sent: job ${dripJobId} to ${phone}`);
    } catch (err) {
      await this.prisma.dripJob.update({
        where: { id: dripJobId },
        data: { status: DripJobStatus.failed },
      });
      this.logger.error(`❌ Drip job failed: ${dripJobId} — ${err.message}`);
      throw err; // Let BullMQ retry
    }
  }

  private async maybeMarkLeadCold(tenantId: string, leadId: string, sequenceId: string) {
    // Check if all jobs for this lead+sequence are done
    const remaining = await this.prisma.dripJob.count({
      where: { tenantId, leadId, sequenceId, status: DripJobStatus.scheduled },
    });

    if (remaining === 0) {
      // All steps completed — mark lead as cold if still in new/contacted status
      await this.prisma.lead.updateMany({
        where: {
          id: leadId,
          tenantId,
          status: { in: [LeadStatus.new, LeadStatus.contacted] },
        },
        data: { status: LeadStatus.cold },
      });
      this.logger.log(`🥶 Lead ${leadId} marked cold after drip sequence completion`);
    }
  }

  private interpolateTemplate(template: string, vars: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
  }

  // ─── Stats ─────────────────────────────────────────────────────────────────

  async getJobsForLead(tenantId: string, leadId: string) {
    return this.prisma.dripJob.findMany({
      where: { tenantId, leadId },
      include: { step: true, sequence: { select: { name: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}
