import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding dummy data...');

  const tenant = await prisma.tenant.findUnique({ where: { slug: 'demo-travels' } });
  if (!tenant) throw new Error('Demo tenant not found. Run main seed first.');

  const owner = await prisma.user.findFirst({ where: { email: 'owner@demotravels.com' } });
  if (!owner) throw new Error('Owner not found.');

  // Create a customer
  const customer = await prisma.customer.upsert({
    where: {
      tenantId_phone: {
        tenantId: tenant.id,
        phone: '+919988776655',
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+919988776655',
      source: 'website',
    }
  });

  // Create a quotation
  const quotation = await prisma.quotation.upsert({
    where: {
      tenantId_quotationNumber: {
        tenantId: tenant.id,
        quotationNumber: 'QT-2026-001'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      quotationNumber: 'QT-2026-001',
      customerId: customer.id,
      destination: 'Dubai, UAE',
      travelDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      adults: 2,
      children: 1,
      infants: 0,
      totalCustomerPrice: 150000,
      totalSupplierCost: 120000,
      status: 'accepted',
      createdBy: owner.id,
    }
  });

  // Create a booking
  const booking = await prisma.booking.upsert({
    where: {
      tenantId_bookingNumber: {
        tenantId: tenant.id,
        bookingNumber: 'TRV-2026-001'
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      bookingNumber: 'TRV-2026-001',
      quotationId: quotation.id,
      customerId: customer.id,
      destination: 'Dubai, UAE',
      travelDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      adults: 2,
      children: 1,
      infants: 0,
      totalAmount: 150000,
      amountPaid: 50000,
      balance: 100000,
      status: 'confirmed',
      createdBy: owner.id,
    }
  });

  // Create travellers
  const traveller1 = await prisma.traveller.create({
    data: {
      tenantId: tenant.id,
      bookingId: booking.id,
      name: 'John Doe',
      type: 'adult',
      gender: 'male',
      passportNumber: 'A12345678',
      passportExpiry: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000), // 2 years from now
    }
  });

  const traveller2 = await prisma.traveller.create({
    data: {
      tenantId: tenant.id,
      bookingId: booking.id,
      name: 'Jane Doe',
      type: 'adult',
      gender: 'female',
      passportNumber: 'B87654321',
      passportExpiry: new Date(Date.now() + 365 * 5 * 24 * 60 * 60 * 1000), // 5 years from now
    }
  });

  // Create Visa Applications
  const uaeTemplate = await prisma.destinationVisaTemplate.findFirst({ where: { destination: 'UAE' } });
  
  if (uaeTemplate) {
    await prisma.visaApplication.create({
      data: {
        tenantId: tenant.id,
        bookingId: booking.id,
        travellerId: traveller1.id,
        destination: 'UAE',
        visaType: 'Tourist',
        status: 'collecting_docs',
        expectedDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      }
    });

    await prisma.visaApplication.create({
      data: {
        tenantId: tenant.id,
        bookingId: booking.id,
        travellerId: traveller2.id,
        destination: 'UAE',
        visaType: 'Tourist',
        status: 'submitted',
        submittedAt: new Date(),
        expectedDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      }
    });
  }

  console.log('✅ Dummy data seeded successfully! Booking TRV-2026-001 created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
