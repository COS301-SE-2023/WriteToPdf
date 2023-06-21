import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { FoldersService } from './folders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('FoldersService', () => {
  let service: FoldersService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          FoldersService,
          {
            provide: getRepositoryToken(
              FoldersService,
            ),
            useClass: Repository,
          },
        ],
      }).compile();

    service = module.get<FoldersService>(
      FoldersService,
    );
  });

  describe('root/config', () => {
    it('folder service should be defined', () => {
      expect(service).toBeDefined();
    });
  });
});
