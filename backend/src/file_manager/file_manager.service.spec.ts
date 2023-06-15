import { Test, TestingModule } from '@nestjs/testing';
import { FileManagerService } from './file_manager.service';

describe('FileManagerService', () => {
  let service: FileManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileManagerService],
    }).compile();

    service = module.get<FileManagerService>(FileManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
