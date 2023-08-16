import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { ShareRequestsService } from './share_requests.service';

describe('ShareRequestsService', () => {
  let service: ShareRequestsService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [ShareRequestsService],
      }).compile();

    service = module.get<ShareRequestsService>(
      ShareRequestsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
