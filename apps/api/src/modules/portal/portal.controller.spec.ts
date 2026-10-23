import { Test, TestingModule } from '@nestjs/testing';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';

describe('PortalController', () => {
  let controller: PortalController;
  let service: any;

  beforeEach(async () => {
    service = {
      requestOtp: jest.fn().mockResolvedValue({ success: true, message: 'OTP sent' }),
      verifyOtp: jest.fn().mockResolvedValue({ success: true, token: 'fake-token' }),
      getDashboardData: jest.fn().mockResolvedValue({ booking: {} }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortalController],
      providers: [
        { provide: PortalService, useValue: service },
      ],
    }).compile();

    controller = module.get<PortalController>(PortalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should request OTP', async () => {
    const res = await controller.requestOtp({ publicSlug: 'slug', phone: '123' });
    expect(res.success).toBe(true);
    expect(service.requestOtp).toHaveBeenCalledWith({ publicSlug: 'slug', phone: '123' });
  });

  it('should verify OTP', async () => {
    const res = await controller.verifyOtp({ publicSlug: 'slug', phone: '123', otp: '111111' });
    expect(res.token).toBe('fake-token');
    expect(service.verifyOtp).toHaveBeenCalledWith({ publicSlug: 'slug', phone: '123', otp: '111111' });
  });
});
