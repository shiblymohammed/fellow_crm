import { Test, TestingModule } from '@nestjs/testing';
import { PortalService } from './portal.service';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappSenderService } from '../whatsapp/whatsapp-sender.service';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  itinerary: {
    findFirst: jest.fn(),
  },
  portalSession: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  booking: {
    findUnique: jest.fn(),
  }
};

const mockWhatsappSenderService = {
  sendText: jest.fn(),
};

describe('PortalService', () => {
  let service: PortalService;
  let prisma: any;
  let whatsapp: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortalService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: WhatsappSenderService, useValue: mockWhatsappSenderService },
      ],
    }).compile();

    service = module.get<PortalService>(PortalService);
    prisma = module.get<PrismaService>(PrismaService);
    whatsapp = module.get<WhatsappSenderService>(WhatsappSenderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestOtp', () => {
    it('should throw NotFoundException if itinerary does not exist', async () => {
      prisma.itinerary.findFirst.mockResolvedValue(null);

      await expect(service.requestOtp({ publicSlug: 'invalid', phone: '123' }))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if phone does not match', async () => {
      prisma.itinerary.findFirst.mockResolvedValue({
        tenantId: 'tenant-1',
        bookingId: 'booking-1',
        booking: {
          customer: { phone: '+919876543210' }
        }
      });

      await expect(service.requestOtp({ publicSlug: 'valid-slug', phone: '1111111111' }))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should generate OTP and send WhatsApp message on success', async () => {
      prisma.itinerary.findFirst.mockResolvedValue({
        tenantId: 'tenant-1',
        bookingId: 'booking-1',
        booking: {
          customer: { id: 'cust-1', name: 'John Doe', phone: '+919876543210' }
        }
      });

      const res = await service.requestOtp({ publicSlug: 'valid-slug', phone: '9876543210' });
      
      expect(prisma.portalSession.create).toHaveBeenCalled();
      expect(whatsapp.sendText).toHaveBeenCalled();
      expect(res.success).toBe(true);
    });
  });
});
