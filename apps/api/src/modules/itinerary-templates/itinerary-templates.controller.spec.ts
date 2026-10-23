import { Test, TestingModule } from '@nestjs/testing';
import { ItineraryTemplatesController } from './itinerary-templates.controller';

describe('ItineraryTemplatesController', () => {
  let controller: ItineraryTemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItineraryTemplatesController],
    }).compile();

    controller = module.get<ItineraryTemplatesController>(ItineraryTemplatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
