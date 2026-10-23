import { Test, TestingModule } from '@nestjs/testing';
import { ItineraryTemplatesService } from './itinerary-templates.service';

describe('ItineraryTemplatesService', () => {
  let service: ItineraryTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItineraryTemplatesService],
    }).compile();

    service = module.get<ItineraryTemplatesService>(ItineraryTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
