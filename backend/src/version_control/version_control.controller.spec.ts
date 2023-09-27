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
import { SnapshotDTO } from '../snapshots/dto/snapshot.dto';
import { VersionSetDTO } from './dto/version_set.dto';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { VersionHistoryDTO } from './dto/version_history.dto';
import { VersionRollbackDTO } from './dto/version_rollback.dto';

describe('VersionControlController', () => {
  let controller: VersionControlController;
  let versionControlService: VersionControlService;
  let snapshotService: SnapshotService;
  let diffsService: DiffsService;

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

    snapshotService = module.get<SnapshotService>(
      SnapshotService,
    );

    diffsService =
      module.get<DiffsService>(DiffsService);

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

  describe('getAllSnapshots', () => {
    it('should call versionControlService.getAllSnapshots', async () => {
      const snapshotDTO = new SnapshotDTO();

      jest
        .spyOn(
          versionControlService,
          'getAllSnapshots',
        )
        .mockResolvedValue(null);

      const result =
        await controller.getAllSnapshots(
          snapshotDTO,
        );

      expect(result).toBeNull();
      expect(
        versionControlService.getAllSnapshots,
      ).toHaveBeenCalledWith(snapshotDTO);
    });
  });

  describe('getHistorySet', () => {
    it('should call versionControlService.getHistorySet', async () => {
      const versionSetDTO = new VersionSetDTO();

      jest
        .spyOn(
          versionControlService,
          'getHistorySet',
        )
        .mockResolvedValue(null);

      const result =
        await controller.getHistorySet(
          versionSetDTO,
        );

      expect(result).toBeNull();
      expect(
        versionControlService.getHistorySet,
      ).toHaveBeenCalledWith(versionSetDTO);
    });
  });

  describe('getSnapshot', () => {
    it('should call versionControlService.getSnapshot', async () => {
      const snapshotDTO = new SnapshotDTO();

      jest
        .spyOn(
          versionControlService,
          'getSnapshot',
        )
        .mockResolvedValue(null);

      const result = await controller.getSnapshot(
        snapshotDTO,
      );

      expect(result).toBeNull();
      expect(
        versionControlService.getSnapshot,
      ).toHaveBeenCalledWith(snapshotDTO);
    });
  });

  describe('loadHistory', () => {
    it('should build a versionHistoryDTO object and return it', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();

      const returnedSnapshots = [
        new Snapshot(),
        new Snapshot(),
      ];

      const returnedSnapshotDTOs = [
        new SnapshotDTO(),
        new SnapshotDTO(),
      ];

      const returnedDiffs = [
        new Diff(),
        new Diff(),
      ];

      const returnedDiffDTOs = [
        new DiffDTO(),
        new DiffDTO(),
      ];

      const expectedVersionHistoryDTO =
        new VersionHistoryDTO();
      expectedVersionHistoryDTO.SnapshotHistory =
        returnedSnapshotDTOs;
      expectedVersionHistoryDTO.DiffHistory =
        returnedDiffDTOs;

      jest
        .spyOn(snapshotService, 'getAllSnapshots')
        .mockResolvedValue(returnedSnapshots);

      jest
        .spyOn(
          versionControlService,
          'convertSnapshotsToSnapshotDTOs',
        )
        .mockResolvedValue(returnedSnapshotDTOs);

      jest
        .spyOn(diffsService, 'getAllDiffs')
        .mockResolvedValue(returnedDiffs);

      jest
        .spyOn(
          versionControlService,
          'convertDiffsToDiffDTOs',
        )
        .mockResolvedValue(returnedDiffDTOs);

      const result = await controller.loadHistory(
        markdownFileDTO,
      );

      expect(result).toEqual(
        expectedVersionHistoryDTO,
      );

      expect(
        snapshotService.getAllSnapshots,
      ).toHaveBeenCalledWith(markdownFileDTO);
      expect(
        versionControlService.convertSnapshotsToSnapshotDTOs,
      ).toHaveBeenCalledWith(returnedSnapshots);
      expect(
        diffsService.getAllDiffs,
      ).toHaveBeenCalledWith(
        markdownFileDTO.MarkdownID,
      );
      expect(
        versionControlService.convertDiffsToDiffDTOs,
      ).toHaveBeenCalledWith(returnedDiffs);
    });
  });

  describe('rollbackVersion', () => {
    it('should call versionControlService.rollbackVersion', async () => {
      const versionRollbackDTO =
        new VersionRollbackDTO();

      jest
        .spyOn(
          versionControlService,
          'rollbackVersion',
        )
        .mockResolvedValue(null);

      const result =
        await controller.rollbackVersion(
          versionRollbackDTO,
        );

      expect(result).toBeNull();
      expect(
        versionControlService.rollbackVersion,
      ).toHaveBeenCalledWith(versionRollbackDTO);
    });
  });
});
