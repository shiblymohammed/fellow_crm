import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Plans
  console.log('Creating subscription plans...');
  
  const basicPlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Basic',
      description: 'Perfect for small agencies starting out',
      price: 4999,
      billingCycle: 'monthly',
      isActive: true,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Pro',
      description: 'For growing agencies with advanced needs',
      price: 9999,
      billingCycle: 'monthly',
      isActive: true,
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Enterprise',
      description: 'Full features including AI assistant',
      price: 19999,
      billingCycle: 'monthly',
      isActive: true,
    },
  });

  console.log('✅ Plans created');

  // 2. Create Super Admin User
  console.log('Creating Super Admin user...');
  
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@fellowcrm.com' },
    update: {},
    create: {
      email: 'admin@fellowcrm.com',
      name: 'Super Admin',
      phone: '+919876543210',
      passwordHash: hashedPassword,
      role: 'super_admin',
      isActive: true,
      tenantId: null, // Super Admin has no tenant
    },
  });

  console.log('✅ Super Admin created');

  // 3. Create Demo Tenant (for testing)
  console.log('Creating demo tenant...');
  
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo-travels' },
    update: {},
    create: {
      name: 'Demo Travels',
      slug: 'demo-travels',
      ownerName: 'Demo Owner',
      ownerEmail: 'owner@demotravels.com',
      ownerPhone: '+919876543211',
      planId: proPlan.id,
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
      aiEnabled: false,
      aiConversationsLimit: 0,
    },
  });

  console.log('✅ Demo tenant created');

  // 4. Create Demo Agency Owner
  console.log('Creating demo agency owner...');
  
  const demoOwnerPassword = await bcrypt.hash('Demo@123456', 10);
  
  const demoOwner = await prisma.user.upsert({
    where: { email: 'owner@demotravels.com' },
    update: {},
    create: {
      email: 'owner@demotravels.com',
      name: 'Demo Owner',
      phone: '+919876543211',
      passwordHash: demoOwnerPassword,
      role: 'agency_owner',
      isActive: true,
      tenantId: demoTenant.id,
    },
  });

  console.log('✅ Demo agency owner created');

  // 5. Enable all features for demo tenant
  console.log('Enabling features for demo tenant...');
  
  const features = [
    'leads_crm',
    'packages',
    'quotations',
    'bookings',
    'payments',
    'documents',
    'visa_management',
    'supplier_management',
    'itinerary_builder',
    'whatsapp_chatbot',
    'whatsapp_automation',
    'reports_analytics',
    'pdf_generation',
  ];

  for (const featureKey of features) {
    await prisma.tenantFeature.upsert({
      where: {
        tenantId_featureKey: {
          tenantId: demoTenant.id,
          featureKey,
        },
      },
      update: {},
      create: {
        tenantId: demoTenant.id,
        featureKey,
        isEnabled: true,
      },
    });
  }

  console.log('✅ Features enabled for demo tenant');

  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('📧 Super Admin Credentials:');
  console.log('   Email: admin@fellowcrm.com');
  console.log('   Password: Admin@123456');
  console.log('');
  console.log('📧 Demo Agency Owner Credentials:');
  console.log('   Email: owner@demotravels.com');
  console.log('   Password: Demo@123456');
  console.log('   Tenant: demo-travels');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
