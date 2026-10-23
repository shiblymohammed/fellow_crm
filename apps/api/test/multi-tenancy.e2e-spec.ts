import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Multi-Tenancy Security (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let tenantA: any;
  let tenantB: any;
  let userA: any;
  let userB: any;
  let tokenA: string;
  let tokenB: string;

  let leadA: any;
  let leadB: any;
  let bookingA: any;
  let bookingB: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    // 1. Create two tenants
    tenantA = await prisma.tenant.create({
      data: {
        name: 'Tenant A Test',
        slug: 'tenant-a-test',
        ownerEmail: 'owner-a@test.com',
      },
    });

    tenantB = await prisma.tenant.create({
      data: {
        name: 'Tenant B Test',
        slug: 'tenant-b-test',
        ownerEmail: 'owner-b@test.com',
      },
    });

    // 2. Create two users
    userA = await prisma.user.create({
      data: {
        tenantId: tenantA.id,
        name: 'User A',
        email: 'user-a@test.com',
        passwordHash: 'hashed-password',
        role: 'agency_owner',
      },
    });

    userB = await prisma.user.create({
      data: {
        tenantId: tenantB.id,
        name: 'User B',
        email: 'user-b@test.com',
        passwordHash: 'hashed-password',
        role: 'agency_owner',
      },
    });

    // 3. Generate tokens
    tokenA = jwtService.sign({ sub: userA.id, email: userA.email, tenantId: tenantA.id, role: userA.role });
    tokenB = jwtService.sign({ sub: userB.id, email: userB.email, tenantId: tenantB.id, role: userB.role });

    // 4. Create Customers
    const customerA = await prisma.customer.create({
      data: {
        tenantId: tenantA.id,
        name: 'Customer A',
        phone: '1111111111',
        source: 'website',
      },
    });

    const customerB = await prisma.customer.create({
      data: {
        tenantId: tenantB.id,
        name: 'Customer B',
        phone: '2222222222',
        source: 'website',
      },
    });

    // 5. Create Leads
    leadA = await prisma.lead.create({
      data: {
        tenantId: tenantA.id,
        customerId: customerA.id,
        source: 'website',
        status: 'new',
      },
    });

    leadB = await prisma.lead.create({
      data: {
        tenantId: tenantB.id,
        customerId: customerB.id,
        source: 'website',
        status: 'new',
      },
    });
    
    // 6. Create Bookings
    bookingA = await prisma.booking.create({
      data: {
        tenantId: tenantA.id,
        bookingNumber: 'B-A-001',
        customerId: customerA.id,
        destination: 'Paris',
        travelDate: new Date(),
        totalAmount: 1000,
        createdBy: userA.id,
      },
    });

    bookingB = await prisma.booking.create({
      data: {
        tenantId: tenantB.id,
        bookingNumber: 'B-B-001',
        customerId: customerB.id,
        destination: 'London',
        travelDate: new Date(),
        totalAmount: 2000,
        createdBy: userB.id,
      },
    });
  });

  afterAll(async () => {
    // Cleanup to prevent polluting DB
    await prisma.booking.deleteMany({ where: { id: { in: [bookingA.id, bookingB.id] } } });
    await prisma.lead.deleteMany({ where: { id: { in: [leadA.id, leadB.id] } } });
    await prisma.customer.deleteMany({ where: { tenantId: { in: [tenantA.id, tenantB.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantA.id, tenantB.id] } } });
    
    await app.close();
  });

  describe('Leads Multi-Tenancy Isolation', () => {
    it('Tenant A should be able to access own lead', () => {
      return request(app.getHttpServer())
        .get(`/leads/${leadA.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual(leadA.id);
        });
    });

    it('Tenant A CANNOT access Tenant B lead', () => {
      return request(app.getHttpServer())
        .get(`/leads/${leadB.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(404); 
    });

    it('Tenant A should only see own leads in list', () => {
      return request(app.getHttpServer())
        .get('/leads')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200)
        .expect((res) => {
          const leads = res.body.data || res.body; // Handle pagination wrapper if exists
          const leadIds = leads.map((l: any) => l.id);
          expect(leadIds).toContain(leadA.id);
          expect(leadIds).not.toContain(leadB.id);
        });
    });
  });

  describe('Bookings Multi-Tenancy Isolation', () => {
    it('Tenant B should be able to access own booking', () => {
      return request(app.getHttpServer())
        .get(`/bookings/${bookingB.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual(bookingB.id);
        });
    });

    it('Tenant B CANNOT access Tenant A booking', () => {
      return request(app.getHttpServer())
        .get(`/bookings/${bookingA.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(404);
    });
  });
});
