import { Test, TestingModule } from '@nestjs/testing';
import { TextractService } from './textract.service';

describe('TextractService', () => {
  let service: TextractService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextractService],
    }).compile();

    service = module.get<TextractService>(TextractService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
