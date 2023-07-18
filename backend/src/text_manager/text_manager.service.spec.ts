import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { TextManagerService } from './text_manager.service';

describe('TextManagerService', () => {
  let service: TextManagerService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [TextManagerService],
      }).compile();

    service = module.get<TextManagerService>(
      TextManagerService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
