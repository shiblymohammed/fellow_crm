import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

export interface QueueConfig {
  name: string;
  processor?: (job: any) => Promise<any>;
  options?: {
    repeat?: {
      pattern?: string; // Cron pattern
      every?: number; // Milliseconds
    };
  };
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly queues = new Map<string, Queue>();
  private readonly workers = new Map<string, Worker>();
  private readonly queueEvents = new Map<string, QueueEvents>();
  private readonly connection: Redis;

  constructor(private configService: ConfigService) {
    // Create Redis connection for BullMQ
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');
    this.connection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
    });

    this.logger.log(`Redis connection configured: ${redisUrl}`);
  }

  async onModuleInit() {
    this.connection.on('connect', () => {
      this.logger.log('✅ Redis connected for BullMQ');
    });

    this.connection.on('error', (error) => {
      this.logger.error('❌ Redis connection error:', error);
    });
  }

  async onModuleDestroy() {
    // Close all workers
    for (const [name, worker] of this.workers.entries()) {
      await worker.close();
      this.logger.log(`Worker closed: ${name}`);
    }

    // Close all queue events
    for (const [name, queueEvent] of this.queueEvents.entries()) {
      await queueEvent.close();
      this.logger.log(`Queue events closed: ${name}`);
    }

    // Close all queues
    for (const [name, queue] of this.queues.entries()) {
      await queue.close();
      this.logger.log(`Queue closed: ${name}`);
    }

    // Close Redis connection
    await this.connection.quit();
    this.logger.log('Redis connection closed');
  }

  /**
   * Register a new queue with optional worker processor
   */
  registerQueue(config: QueueConfig): Queue {
    const { name, processor, options } = config;

    // Create queue if not exists
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: this.connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 500, // Keep last 500 failed jobs
        },
      });

      this.queues.set(name, queue);
      this.logger.log(`✅ Queue registered: ${name}`);

      // Setup queue events for monitoring
      const queueEvents = new QueueEvents(name, {
        connection: this.connection,
      });

      queueEvents.on('completed', ({ jobId }) => {
        this.logger.debug(`Job completed: ${name}/${jobId}`);
      });

      queueEvents.on('failed', ({ jobId, failedReason }) => {
        this.logger.error(`Job failed: ${name}/${jobId} - ${failedReason}`);
      });

      this.queueEvents.set(name, queueEvents);
    }

    const queue = this.queues.get(name)!;

    // Register processor if provided
    if (processor && !this.workers.has(name)) {
      const worker = new Worker(name, processor, {
        connection: this.connection,
      });

      worker.on('completed', (job) => {
        this.logger.log(`✅ Worker completed job: ${name}/${job.id}`);
      });

      worker.on('failed', (job, err) => {
        this.logger.error(`❌ Worker failed job: ${name}/${job?.id} - ${err.message}`);
      });

      this.workers.set(name, worker);
      this.logger.log(`✅ Worker registered: ${name}`);
    }

    return queue;
  }

  /**
   * Get an existing queue
   */
  getQueue(name: string): Queue | undefined {
    return this.queues.get(name);
  }

  /**
   * Add a job to a queue
   */
  async addJob(queueName: string, jobName: string, data: any, options?: any) {
    const queue = this.getQueue(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }

    const job = await queue.add(jobName, data, options);
    this.logger.log(`Job added: ${queueName}/${jobName}/${job.id}`);
    return job;
  }

  /**
   * Add a repeating job (scheduled/cron job)
   */
  async addRepeatingJob(
    queueName: string,
    jobName: string,
    data: any,
    repeatOptions: { pattern?: string; every?: number },
  ) {
    const queue = this.getQueue(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }

    // Use the repeat option as per BullMQ v5 API
    const job = await queue.add(jobName, data, {
      repeat: repeatOptions as any, // Type assertion for BullMQ v5 API
    } as any);

    this.logger.log(
      `Repeating job added: ${queueName}/${jobName} - ${JSON.stringify(repeatOptions)}`,
    );
    return job;
  }

  /**
   * Remove all repeating jobs for a queue
   */
  async removeRepeatingJobs(queueName: string) {
    const queue = this.getQueue(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }

    // Use type assertion for BullMQ v5 API
    const queueAny = queue as any;
    const repeatableJobs = await queueAny.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await queueAny.removeRepeatableByKey(job.key);
    }

    this.logger.log(`All repeating jobs removed from: ${queueName}`);
  }
}
