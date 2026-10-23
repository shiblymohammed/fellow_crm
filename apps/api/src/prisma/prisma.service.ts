import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly cls: ClsService) {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    const self = this;
    const extended = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            // Check if tenantId is available in context
            const tenantId = cls.isActive() ? cls.get('tenantId') : undefined;
            const nonTenantModels = ['Tenant', 'Plan', 'TenantFeature', 'PlatformLead', 'TenantBilling'];
            
            if (tenantId && !nonTenantModels.includes(model as string)) {
              const anyArgs = args as any;
              
              if (['findMany', 'findFirst', 'findFirstOrThrow', 'count', 'updateMany', 'deleteMany'].includes(operation)) {
                anyArgs.where = { ...anyArgs.where, tenantId };
                return query(args);
              } else if (operation === 'findUnique' || operation === 'findUniqueOrThrow') {
                // Post-check for unique lookups to avoid Prisma strict where clause errors
                const result = await query(args);
                const anyResult = result as any;
                if (anyResult && anyResult.tenantId && anyResult.tenantId !== tenantId) {
                  if (operation === 'findUniqueOrThrow') throw new Error('Not found');
                  return null;
                }
                return result;
              } else if (operation === 'update' || operation === 'delete') {
                // Pre-check ownership for mutations to prevent unauthorized modification
                if (anyArgs.where) {
                  const record = await (self as any)[model as string].findUnique({
                    where: anyArgs.where,
                    select: { tenantId: true }
                  });
                  if (record && record.tenantId && record.tenantId !== tenantId) {
                    throw new Error(`Unauthorized to ${operation} this ${model as string}`);
                  }
                }
                return query(args);
              } else if (operation === 'create' || operation === 'createMany') {
                if (anyArgs.data) {
                  if (Array.isArray(anyArgs.data)) {
                    anyArgs.data.forEach((d: any) => {
                       d.tenantId = tenantId; // Force overwrite
                    });
                  } else {
                    anyArgs.data.tenantId = tenantId; // Force overwrite
                  }
                }
                return query(args);
              }
            }
            return query(args);
          }
        }
      }
    });

    return new Proxy(this, {
      get: (target, prop) => {
        if (prop in extended) {
          return extended[prop as keyof typeof extended];
        }
        return target[prop as keyof typeof target];
      }
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('👋 Database disconnected');
  }
}
