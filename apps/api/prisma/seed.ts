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

  // 3. Create Global Visa Templates
  console.log('Creating global visa templates...');
  
  const visaTemplates = [
    {
      id: '10000000-1111-1111-1111-000000000001',
      destination: 'UAE',
      checklistItems: [
        { itemName: 'Passport (minimum 6 months validity)', isRequired: true },
        { itemName: 'Passport size photograph', isRequired: true },
        { itemName: 'Flight tickets', isRequired: true },
        { itemName: 'Hotel booking confirmation', isRequired: true },
        { itemName: 'Travel insurance', isRequired: false },
      ],
      notes: 'UAE tourist visa typically takes 3-5 working days. Express processing available.',
    },
    {
      id: '10000000-1111-1111-1111-000000000002',
      destination: 'Schengen',
      checklistItems: [
        { itemName: 'Passport (minimum 6 months validity)', isRequired: true },
        { itemName: 'Two recent passport photographs', isRequired: true },
        { itemName: 'Flight reservation', isRequired: true },
        { itemName: 'Hotel booking/accommodation proof', isRequired: true },
        { itemName: 'Travel insurance (minimum EUR 30,000 coverage)', isRequired: true },
        { itemName: 'Bank statements (last 6 months)', isRequired: true },
        { itemName: 'Cover letter', isRequired: true },
        { itemName: 'Employment letter', isRequired: false },
        { itemName: 'ITR/Tax documents', isRequired: false },
      ],
      notes: 'Schengen visa processing takes 15-20 working days. Apply at least 30 days before travel.',
    },
    {
      id: '10000000-1111-1111-1111-000000000003',
      destination: 'USA',
      checklistItems: [
        { itemName: 'Valid passport', isRequired: true },
        { itemName: 'DS-160 confirmation page', isRequired: true },
        { itemName: 'Visa appointment confirmation', isRequired: true },
        { itemName: 'Passport photograph (5x5 cm)', isRequired: true },
        { itemName: 'Flight reservation', isRequired: true },
        { itemName: 'Hotel booking', isRequired: true },
        { itemName: 'Bank statements (last 6 months)', isRequired: true },
        { itemName: 'Employment letter', isRequired: true },
        { itemName: 'ITR for last 3 years', isRequired: true },
        { itemName: 'Previous US visa (if any)', isRequired: false },
      ],
      notes: 'US B1/B2 visa requires in-person interview at embassy. Processing may take 3-6 weeks.',
    },
    {
      id: '10000000-1111-1111-1111-000000000004',
      destination: 'UK',
      checklistItems: [
        { itemName: 'Passport (minimum 6 months validity)', isRequired: true },
        { itemName: 'Passport photographs', isRequired: true },
        { itemName: 'Visa application form', isRequired: true },
        { itemName: 'Flight tickets', isRequired: true },
        { itemName: 'Hotel booking confirmation', isRequired: true },
        { itemName: 'Bank statements (last 6 months)', isRequired: true },
        { itemName: 'Employment proof', isRequired: true },
        { itemName: 'Travel insurance', isRequired: true },
        { itemName: 'Cover letter', isRequired: true },
      ],
      notes: 'UK tourist visa processing takes 15-20 working days. Biometrics required.',
    },
    {
      id: '10000000-1111-1111-1111-000000000005',
      destination: 'Singapore',
      checklistItems: [
        { itemName: 'Passport (minimum 6 months validity)', isRequired: true },
        { itemName: 'Passport photograph', isRequired: true },
        { itemName: 'Flight booking', isRequired: true },
        { itemName: 'Hotel confirmation', isRequired: true },
        { itemName: 'Bank statement (last 3 months)', isRequired: true },
        { itemName: 'Cover letter', isRequired: false },
      ],
      notes: 'Singapore visa typically processed in 3-5 working days.',
    },
    {
      id: '10000000-1111-1111-1111-000000000006',
      destination: 'Australia',
      checklistItems: [
        { itemName: 'Valid passport', isRequired: true },
        { itemName: 'Passport photograph', isRequired: true },
        { itemName: 'Flight reservation', isRequired: true },
        { itemName: 'Hotel bookings', isRequired: true },
        { itemName: 'Bank statements (last 6 months)', isRequired: true },
        { itemName: 'Employment letter', isRequired: true },
        { itemName: 'Travel insurance', isRequired: true },
        { itemName: 'Cover letter', isRequired: true },
      ],
      notes: 'Australia visitor visa (subclass 600) processing takes 15-30 days.',
    },
    {
      id: '10000000-1111-1111-1111-000000000007',
      destination: 'Thailand',
      checklistItems: [
        { itemName: 'Passport (minimum 6 months validity)', isRequired: true },
        { itemName: 'Passport photograph', isRequired: true },
        { itemName: 'Flight tickets', isRequired: true },
        { itemName: 'Hotel booking', isRequired: true },
        { itemName: 'Bank statement', isRequired: false },
      ],
      notes: 'Indian citizens can get visa on arrival or e-visa for Thailand. Processing: 3-5 days.',
    },
  ];

  for (const template of visaTemplates) {
    await prisma.destinationVisaTemplate.upsert({
      where: { id: template.id },
      update: {},
      create: {
        id: template.id,
        tenantId: null,
        isGlobal: true,
        destination: template.destination,
        checklistItems: template.checklistItems,
        notes: template.notes,
      },
    });
  }

  console.log('✅ Global visa templates created');

  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('📧 Super Admin Credentials:');
  console.log('   Email: admin@fellowcrm.com');
  console.log('   Password: Admin@123456');
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
