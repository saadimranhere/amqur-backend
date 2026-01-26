import { Test, TestingModule } from '@nestjs/testing';
import { InventoryFeedService } from './inventory-feed.service';

describe('InventoryFeedService', () => {
  let service: InventoryFeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventoryFeedService],
    }).compile();

    service = module.get<InventoryFeedService>(InventoryFeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
