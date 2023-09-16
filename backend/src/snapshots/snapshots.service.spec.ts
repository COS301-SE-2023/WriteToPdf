import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { SnapshotService } from './snapshots.service';
import { Snapshot } from './entities/snapshots.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('DiffService', () => {
  let service: SnapshotService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          SnapshotService,
          {
            provide: getRepositoryToken(Snapshot),
            useClass: Repository,
          },
        ],
      }).compile();

    service = module.get<SnapshotService>(
      SnapshotService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
