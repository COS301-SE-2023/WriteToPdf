import {
  Test,
  TestingModule,
} from '@nestjs/testing';

import { VersionControlService } from './version_control.service';
import { DiffsService } from '../diffs/diffs.service';
import { VersionControlController } from './version_control.controller';
import { SnapshotService } from '../snapshots/snapshots.service';
import { DiffDTO } from '../diffs/dto/diffs.dto';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { S3Service } from '../s3/s3.service';
import { S3ServiceMock } from '../s3/__mocks__/s3.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Snapshot } from '../snapshots/entities/snapshots.entity';
import { Repository } from 'typeorm';
import { Diff } from '../diffs/entities/diffs.entity';
import { MarkdownFile } from '../markdown_files/entities/markdown_file.entity';

describe('VersionControlController', () => {
  let controller: VersionControlController;
  let versionControlService: VersionControlService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [VersionControlController],
        providers: [
          VersionControlService,
          SnapshotService,
          DiffsService,
          MarkdownFilesService,
          S3Service,
          S3ServiceMock,
          {
            provide: getRepositoryToken(Snapshot),
            useClass: Repository,
          },
          {
            provide: getRepositoryToken(Diff),
            useClass: Repository,
          },
          {
            provide:
              getRepositoryToken(MarkdownFile),
            useClass: Repository,
          },
        ],
      }).compile();

    controller =
      module.get<VersionControlController>(
        VersionControlController,
      );

    versionControlService =
      module.get<VersionControlService>(
        VersionControlService,
      );

    module.close();
  });

  describe('saveDiff', () => {
    it('should call versionControlService.saveDiff', async () => {
      const diffDTO = new DiffDTO();

      jest
        .spyOn(versionControlService, 'saveDiff')
        .mockResolvedValue(null);

      await controller.saveDiff(diffDTO);

      expect(
        versionControlService.saveDiff,
      ).toHaveBeenCalledWith(diffDTO);
    });
  });
});
