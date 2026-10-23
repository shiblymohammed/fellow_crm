import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceTemplatesController } from './marketplace-templates.controller';

describe('MarketplaceTemplatesController', () => {
  let controller: MarketplaceTemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketplaceTemplatesController],
    }).compile();

    controller = module.get<MarketplaceTemplatesController>(MarketplaceTemplatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
