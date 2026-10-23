import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceTemplatesService } from './marketplace-templates.service';

describe('MarketplaceTemplatesService', () => {
  let service: MarketplaceTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketplaceTemplatesService],
    }).compile();

    service = module.get<MarketplaceTemplatesService>(MarketplaceTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
