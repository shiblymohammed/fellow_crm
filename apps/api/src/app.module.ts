import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { join } from 'path';
import { ClsModule } from 'nestjs-cls';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { FeatureGuard } from './common/guards/feature.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';
import { MailModule } from './modules/mail/mail.module';
import { PlansModule } from './modules/plans/plans.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { FeaturesModule } from './modules/features/features.module';
import { PlatformLeadsModule } from './modules/platform-leads/platform-leads.module';
import { TenantBillingModule } from './modules/tenant-billing/tenant-billing.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CustomersModule } from './modules/customers/customers.module';
import { LeadsModule } from './modules/leads/leads.module';
import { FollowupsModule } from './modules/followups/followups.module';
import { LeadNotesModule } from './modules/lead-notes/lead-notes.module';
import { PackagesModule } from './modules/packages/packages.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { StorageModule } from './modules/storage/storage.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { QueueModule } from './modules/queue/queue.module';
import { TravellersModule } from './modules/travellers/travellers.module';
import { TravellerDocumentsModule } from './modules/traveller-documents/traveller-documents.module';
import { VisaApplicationsModule } from './modules/visa-applications/visa-applications.module';
import { DestinationVisaTemplatesModule } from './modules/destination-visa-templates/destination-visa-templates.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { SupplierBookingsModule } from './modules/supplier-bookings/supplier-bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SupplierPaymentsModule } from './modules/supplier-payments/supplier-payments.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { ProfitModule } from './modules/profit/profit.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { DripModule } from './modules/drip/drip.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ItineraryTemplatesModule } from './modules/itinerary-templates/itinerary-templates.module';
import { ItinerariesModule } from './modules/itineraries/itineraries.module';
import { PortalModule } from './modules/portal/portal.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AiModule } from './modules/ai/ai.module';
import { MarketplaceTemplatesModule } from './modules/marketplace-templates/marketplace-templates.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '../../.env'),
    }),
    // Rate limiting - prevent brute force attacks
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 10, // 10 requests per minute per IP
    }]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET, // No default - will fail if not set
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const { createKeyv } = await import('@keyv/redis');
        return {
          stores: [
            createKeyv(process.env.REDIS_URL || 'redis://localhost:6379'),
          ],
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    MailModule,
    PlansModule,
    TenantsModule,
    FeaturesModule,
    PlatformLeadsModule,
    TenantBillingModule,
    DashboardModule,
    CustomersModule,
    LeadsModule,
    FollowupsModule,
    LeadNotesModule,
    PackagesModule,
    QuotationsModule,
    BookingsModule,
    StorageModule,
    PdfModule,
    QueueModule,
    TravellersModule,
    TravellerDocumentsModule,
    VisaApplicationsModule,
    DestinationVisaTemplatesModule,
    SuppliersModule,
    SupplierBookingsModule,
    PaymentsModule,
    SupplierPaymentsModule,
    ExpensesModule,
    ProfitModule,
    WhatsappModule,
    DripModule,
    NotificationsModule,
    ItineraryTemplatesModule,
    ItinerariesModule,
    PortalModule,
    ReportsModule,
    AiModule,
    MarketplaceTemplatesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Rate limiting guard
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: FeatureGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantContextMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
