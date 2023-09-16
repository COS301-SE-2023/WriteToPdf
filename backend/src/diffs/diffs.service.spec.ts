import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { DiffsService } from './diffs.service';
import { Diff } from './entities/diffs.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('DiffService', () => {
  let service: DiffsService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          DiffsService,
          {
            provide:
              getRepositoryToken(Diff),
            useClass: Repository,
          },
        ],
      }).compile();

    service = module.get<DiffsService>(
      DiffsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});