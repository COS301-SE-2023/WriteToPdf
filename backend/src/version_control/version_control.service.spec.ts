import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { VersionControlService } from './version_control.service';
import { DiffsService } from '../diffs/diffs.service';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { S3Service } from '../s3/s3.service';
import { S3ServiceMock } from '../s3/__mocks__/s3.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Diff } from '../diffs/entities/diffs.entity';
import { Repository } from 'typeorm';
import { MarkdownFile } from '../markdown_files/entities/markdown_file.entity';
import { SnapshotService } from '../snapshots/snapshots.service';
import { Snapshot } from '../snapshots/entities/snapshots.entity';
import { DiffDTO } from '../diffs/dto/diffs.dto';
import { SnapshotDTO } from '../snapshots/dto/snapshot.dto';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { VersionRollbackDTO } from './dto/version_rollback.dto';
import { VersionSetDTO } from './dto/version_set.dto';
import { VersionHistoryDTO } from './dto/version_history.dto';

describe('VersionControlService', () => {
  let service: VersionControlService;
  let diffsService: DiffsService;
  let markdownFilesService: MarkdownFilesService;
  let snapshotService: SnapshotService;
  let s3Service: S3Service;
  let s3ServiceMock: S3ServiceMock;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          VersionControlService,
          DiffsService,
          MarkdownFilesService,
          S3Service,
          S3ServiceMock,
          SnapshotService,
          {
            provide: getRepositoryToken(Diff),
            useClass: Repository,
          },
          {
            provide:
              getRepositoryToken(MarkdownFile),
            useClass: Repository,
          },
          {
            provide: getRepositoryToken(Snapshot),
            useClass: Repository,
          },
        ],
      }).compile();

    service = module.get<VersionControlService>(
      VersionControlService,
    );

    diffsService =
      module.get<DiffsService>(DiffsService);

    markdownFilesService =
      module.get<MarkdownFilesService>(
        MarkdownFilesService,
      );

    s3Service = module.get<S3Service>(S3Service);

    s3ServiceMock = module.get<S3ServiceMock>(
      S3ServiceMock,
    );

    snapshotService = module.get<SnapshotService>(
      SnapshotService,
    );
  });

  describe('saveSnapshot', () => {
    const diffDTO = new DiffDTO();
    const nextSnaphshotID = 0;
    it('should call the s3Service and save snapshot correctly', async () => {
      jest.spyOn(s3Service, 'saveSnapshot');

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValueOnce(new Snapshot());

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValueOnce(new Snapshot());

      jest
        .spyOn(Repository.prototype, 'findOneBy')
        .mockResolvedValueOnce(
          new MarkdownFile(),
        );

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValueOnce(
          new MarkdownFile(),
        );

      jest.spyOn(
        snapshotService,
        'updateSnapshot',
      );

      const response = await service.saveSnapshot(
        diffDTO,
        nextSnaphshotID,
        0,
      );

      expect(response).toEqual(undefined);
      expect(
        s3Service.saveSnapshot,
      ).toHaveBeenCalled();
    });

    it('should get all snapshots', async () => {
      const snapshotDTO = new SnapshotDTO();
      jest
        .spyOn(Repository.prototype, 'findOneBy')
        .mockResolvedValueOnce(
          new MarkdownFile(),
        );

      jest
        .spyOn(service, 'getLogicalOrder')
        .mockResolvedValueOnce(
          new Array<number>() as never,
        );

      const response =
        await service.getAllSnapshots(
          snapshotDTO,
        );

      expect(response).toEqual([]);
    });
  });

  describe('saveDiff', () => {
    it('should save the diff if there is a next diff and next snapshot', async () => {
      const diffDTO = new DiffDTO();
      diffDTO.MarkdownID = 'test';

      const saveDiffInfoDTO = {
        nextDiffIndex: 1,
        nextSnapshotIndex: 1,
        totalNumDiffs: 2,
        totalNumSnapshots: 2,
      };

      const nextDiff = new Diff();

      const nextSnapshot = new Snapshot();
      nextSnapshot.SnapshotID = 'test';

      jest
        .spyOn(
          markdownFilesService,
          'getSaveDiffInfo',
        )
        .mockResolvedValue(saveDiffInfoDTO);

      jest
        .spyOn(diffsService, 'getDiff')
        .mockResolvedValue(nextDiff);

      jest
        .spyOn(snapshotService, 'getSnapshot')
        .mockResolvedValue(nextSnapshot);

      jest
        .spyOn(service, 'createDiff')
        .mockResolvedValue(null);

      jest
        .spyOn(snapshotService, 'createSnapshot')
        .mockResolvedValue(nextSnapshot);

      jest
        .spyOn(service, 'saveDiffContent')
        .mockResolvedValue(null);

      jest
        .spyOn(service, 'saveSnapshot')
        .mockResolvedValue(null);

      await service.saveDiff(diffDTO);

      expect(
        markdownFilesService.getSaveDiffInfo,
      ).toHaveBeenCalledWith(diffDTO.MarkdownID);
      expect(
        diffsService.getDiff,
      ).toHaveBeenCalledWith(
        diffDTO,
        saveDiffInfoDTO.nextDiffIndex,
      );
      expect(
        snapshotService.getSnapshot,
      ).toHaveBeenCalledWith(
        diffDTO.MarkdownID,
        saveDiffInfoDTO.nextSnapshotIndex,
      );
      expect(
        diffsService.getDiff,
      ).toHaveBeenCalledWith(
        diffDTO,
        saveDiffInfoDTO.nextDiffIndex,
      );
      expect(
        service.saveDiffContent,
      ).toHaveBeenCalledWith(
        diffDTO,
        saveDiffInfoDTO.nextDiffIndex,
        nextSnapshot.SnapshotID,
      );
    });
  });

  describe('saveDiffContent', () => {
    it('should save the diff content', async () => {
      const diffDTO = new DiffDTO();
      diffDTO.MarkdownID = 'test';

      const nextDiffIndex = 1;
      const snapshotID = 'test';

      jest
        .spyOn(diffsService, 'updateDiff')
        .mockResolvedValue(null);

      jest
        .spyOn(s3Service, 'saveDiff')
        .mockResolvedValue(null);

      jest
        .spyOn(
          markdownFilesService,
          'incrementNextDiffIndex',
        )
        .mockResolvedValue(null);

      jest
        .spyOn(
          markdownFilesService,
          'incrementTotalNumDiffs',
        )
        .mockResolvedValue(null);

      await service.saveDiffContent(
        diffDTO,
        nextDiffIndex,
        snapshotID,
      );

      expect(
        diffsService.updateDiff,
      ).toHaveBeenCalledWith(
        diffDTO,
        nextDiffIndex,
        snapshotID,
      );
      expect(
        s3Service.saveDiff,
      ).toHaveBeenCalledWith(
        diffDTO,
        nextDiffIndex,
      );
      expect(
        markdownFilesService.incrementNextDiffIndex,
      ).toHaveBeenCalledWith(diffDTO.MarkdownID);
      expect(
        markdownFilesService.incrementTotalNumDiffs,
      ).toHaveBeenCalledWith(diffDTO.MarkdownID);
    });
  });

  describe('createDiff', () => {
    it('should create a diff and save it on s3', async () => {
      const diffDTO = new DiffDTO();
      diffDTO.MarkdownID = 'test';
      diffDTO.UserID = 1;
      const nextDiffIndex = 1;

      const createdMarkdownFileDTO =
        new MarkdownFileDTO();
      createdMarkdownFileDTO.MarkdownID =
        diffDTO.MarkdownID;
      createdMarkdownFileDTO.UserID =
        diffDTO.UserID;
      createdMarkdownFileDTO.NextDiffIndex =
        nextDiffIndex;

      jest
        .spyOn(s3Service, 'saveDiff')
        .mockResolvedValueOnce(null);

      jest
        .spyOn(
          diffsService,
          'createDiffWithoutSnapshotID',
        )
        .mockResolvedValueOnce(diffDTO as any);

      const result = await service.createDiff(
        diffDTO,
        nextDiffIndex,
      );

      expect(result).toEqual(diffDTO);
      expect(
        diffsService.createDiffWithoutSnapshotID,
      ).toHaveBeenCalledWith(
        createdMarkdownFileDTO,
      );
      expect(
        s3Service.saveDiff,
      ).toHaveBeenCalledWith(
        diffDTO,
        nextDiffIndex,
      );
    });
  });

  describe('createSnapshot', () => {
    it('should create a snapshot and save it on s3', async () => {
      const diffDTO = new DiffDTO();
      diffDTO.MarkdownID = 'test';
      diffDTO.UserID = 1;
      const nextSnapshotIndex = 1;

      const createdMarkdownFileDTO =
        new MarkdownFileDTO();
      createdMarkdownFileDTO.MarkdownID =
        diffDTO.MarkdownID;
      createdMarkdownFileDTO.UserID =
        diffDTO.UserID;
      createdMarkdownFileDTO.NextSnapshotIndex =
        nextSnapshotIndex;

      const newSnapshot = new Snapshot();

      jest
        .spyOn(s3Service, 'saveSnapshot')
        .mockResolvedValueOnce(null);

      jest
        .spyOn(snapshotService, 'createSnapshot')
        .mockResolvedValueOnce('test');

      jest
        .spyOn(snapshotService, 'getSnapshotByID')
        .mockResolvedValueOnce(newSnapshot);

      const result = await service.createSnapshot(
        diffDTO,
        nextSnapshotIndex,
      );

      expect(result).toEqual(newSnapshot);
      expect(
        snapshotService.createSnapshot,
      ).toHaveBeenCalledWith(
        createdMarkdownFileDTO,
      );
      expect(
        s3Service.saveSnapshot,
      ).toHaveBeenCalledWith(
        diffDTO,
        nextSnapshotIndex,
      );
      expect(
        snapshotService.getSnapshotByID,
      ).toHaveBeenCalledWith('test');
    });
  });

  describe('getSnapshot', () => {
    it('should get a snapshot from s3', async () => {
      const snapshotDTO = new SnapshotDTO();
      snapshotDTO.MarkdownID = 'test';
      snapshotDTO.UserID = 1;
      snapshotDTO.S3SnapshotIndex = 1;

      jest
        .spyOn(s3Service, 'getSnapshot')
        .mockResolvedValueOnce(snapshotDTO);

      const result = await service.getSnapshot(
        snapshotDTO,
      );

      expect(result).toEqual(snapshotDTO);
      expect(
        s3Service.getSnapshot,
      ).toHaveBeenCalledWith(
        snapshotDTO.S3SnapshotIndex,
        snapshotDTO.UserID,
        snapshotDTO.MarkdownID,
      );
    });
  });

  describe('getAllSnapshots', () => {
    it('should get all snapshots', async () => {
      const snapshotDTO = new SnapshotDTO();
      snapshotDTO.MarkdownID = 'test';

      const snapshotRange = [1];
      const nextSnapshotID = 1;
      const logicalOrder = [1];
      const snapshots = [new SnapshotDTO()];

      jest
        .spyOn(Array, 'from')
        .mockReturnValueOnce(snapshotRange);

      jest
        .spyOn(
          markdownFilesService,
          'getNextSnapshotIndex',
        )
        .mockResolvedValueOnce(nextSnapshotID);

      jest
        .spyOn(service, 'getLogicalOrder')
        .mockReturnValue(logicalOrder);

      jest
        .spyOn(s3Service, 'retrieveAllSnapshots')
        .mockResolvedValueOnce(snapshots);

      jest
        .spyOn(service, 'pruneEmptySnapshots')
        .mockImplementationOnce(
          (snapshots) => snapshots,
        );

      const result =
        await service.getAllSnapshots(
          snapshotDTO,
        );

      expect(result).toEqual(snapshots);
      expect(
        markdownFilesService.getNextSnapshotIndex,
      ).toHaveBeenCalledWith(
        snapshotDTO.MarkdownID,
      );
      expect(Array.from).toHaveBeenCalled();
      expect(
        service.getLogicalOrder,
      ).toHaveBeenCalledWith(
        snapshotRange,
        nextSnapshotID,
      );
      expect(
        s3Service.retrieveAllSnapshots,
      ).toHaveBeenCalledWith(
        logicalOrder,
        snapshotDTO,
      );
      expect(
        service.pruneEmptySnapshots,
      ).toHaveBeenCalledWith(snapshots);
    });
  });

  describe('resetSubsequentDiffs', () => {
    it('should reset subsequent diffs', async () => {
      const markdownID = 'test';
      const diffIndicesToReset = [1, 2, 3];

      jest
        .spyOn(
          diffsService,
          'updateDiffsAfterRestore',
        )
        .mockResolvedValueOnce(null);

      await service.resetSubsequentDiffs(
        markdownID,
        diffIndicesToReset,
      );

      expect(
        diffsService.updateDiffsAfterRestore,
      ).toHaveBeenCalledWith(
        markdownID,
        diffIndicesToReset,
      );
    });
  });

  describe('resetSubsequentSnapshots', () => {
    it('should reset subsequent snapshots', async () => {
      const markdownID = 'test';
      const diffIndicesToReset = [1, 2, 3];
      const snapshotIDsToReset = ['1', '2', '3'];
      const snapshotIndicesToReset = [1, 2, 3];

      jest
        .spyOn(
          diffsService,
          'getSnapshotsToReset',
        )
        .mockResolvedValueOnce(
          snapshotIDsToReset,
        );

      jest
        .spyOn(snapshotService, 'resetSnapshot')
        .mockResolvedValueOnce(
          snapshotIndicesToReset,
        );

      const result =
        await service.resetSubsequentSnapshots(
          markdownID,
          diffIndicesToReset,
        );

      expect(result).toEqual(
        snapshotIndicesToReset,
      );
      expect(
        diffsService.getSnapshotsToReset,
      ).toHaveBeenCalledWith(
        markdownID,
        diffIndicesToReset,
      );
      expect(
        snapshotService.resetSnapshot,
      ).toHaveBeenCalledWith(
        markdownID,
        snapshotIDsToReset,
      );
    });
  });

  describe('getDiffIndicesToReset', () => {
    it('should get diff indices to reset', async () => {
      const nextDiffIndex = 1;
      const restorationDIffIndex = 2;

      const expectedArray = [3];

      const originalMaxDiffs =
        process.env.MAX_DIFFS;
      process.env.MAX_DIFFS = '3';
      try {
        const result =
          service.getDiffIndicesToReset(
            nextDiffIndex,
            restorationDIffIndex,
          );

        expect(result).toEqual(expectedArray);
      } finally {
        process.env.MAX_DIFFS = originalMaxDiffs;
      }
    });
  });

  describe('buildRestoreVersionDTO', () => {
    it('should build the restore version dto', async () => {
      const versionRollbackDTO =
        new VersionRollbackDTO();
      versionRollbackDTO.MarkdownID = 'test';
      versionRollbackDTO.UserID = 0;
      versionRollbackDTO.Content = 'test';

      const nextDiffIndex = 1;
      const nextSnapshotIndex = 2;

      const expectedMarkdownFileDTO =
        new MarkdownFileDTO();
      expectedMarkdownFileDTO.MarkdownID =
        versionRollbackDTO.MarkdownID;
      expectedMarkdownFileDTO.UserID =
        versionRollbackDTO.UserID;
      expectedMarkdownFileDTO.Content =
        versionRollbackDTO.Content;
      expectedMarkdownFileDTO.NextDiffIndex =
        nextDiffIndex;
      expectedMarkdownFileDTO.NextSnapshotIndex =
        nextSnapshotIndex;

      jest
        .spyOn(
          markdownFilesService,
          'getNextDiffIndex',
        )
        .mockResolvedValue(nextDiffIndex);

      jest
        .spyOn(
          markdownFilesService,
          'getNextSnapshotIndex',
        )
        .mockResolvedValue(nextSnapshotIndex);

      const result =
        await service.buildRestoreVersionDTO(
          versionRollbackDTO,
        );

      expect(result).toEqual(
        expectedMarkdownFileDTO,
      );
      expect(
        markdownFilesService.getNextDiffIndex,
      ).toHaveBeenCalledWith(
        versionRollbackDTO.MarkdownID,
      );
      expect(
        markdownFilesService.getNextSnapshotIndex,
      ).toHaveBeenCalledWith(
        versionRollbackDTO.MarkdownID,
      );
    });
  });

  describe('convertSnapshotsToSnapshotDTOs', () => {
    it('should convert snapshots to snapshot dtos', async () => {
      const snapshot = new Snapshot();
      snapshot.SnapshotID = 'test';
      snapshot.UserID = 0;
      snapshot.MarkdownID = 'test';
      snapshot.S3SnapshotIndex = 1;
      snapshot.LastModified = new Date();

      const snapshotDTO = new SnapshotDTO();
      snapshotDTO.SnapshotID =
        snapshot.SnapshotID;
      snapshotDTO.UserID = snapshot.UserID;
      snapshotDTO.MarkdownID =
        snapshot.MarkdownID;
      snapshotDTO.S3SnapshotIndex =
        snapshot.S3SnapshotIndex;
      snapshotDTO.LastModified =
        snapshot.LastModified;

      const snapshots = [snapshot];

      const result =
        await service.convertSnapshotsToSnapshotDTOs(
          snapshots,
        );

      expect(result).toEqual([snapshotDTO]);
    });
  });

  describe('convertDiffsToDiffDTOs', () => {
    it('should convert diffs to diff dtos', async () => {
      const diff = new Diff();
      diff.DiffID = 'test';
      diff.UserID = 0;
      diff.MarkdownID = 'test';
      diff.S3DiffIndex = 1;
      diff.SnapshotID = 'test';
      diff.LastModified = new Date();

      const diffDTO = new DiffDTO();
      diffDTO.DiffID = diff.DiffID;
      diffDTO.UserID = diff.UserID;
      diffDTO.MarkdownID = diff.MarkdownID;
      diffDTO.S3DiffIndex = diff.S3DiffIndex;
      diffDTO.SnapshotID = diff.SnapshotID;
      diffDTO.LastModified = diff.LastModified;

      const diffs = [diff];

      const result =
        await service.convertDiffsToDiffDTOs(
          diffs,
        );

      expect(result).toEqual([diffDTO]);
    });
  });

  describe('getLogicalIndex', () => {
    it('should get the logical index', async () => {
      const s3Index = 1;
      const head = 1;
      const arr_len = 3;

      const result = service.getLogicalIndex(
        s3Index,
        head,
        arr_len,
      );

      expect(result).toEqual(
        (s3Index - head + arr_len) % arr_len,
      );
    });
  });

  describe('getIndexInS3', () => {
    it('should get the index in s3', () => {
      const logicalIndex = 1;
      const arr_len = 3;
      const head = 1;

      const result = service.getIndexInS3(
        logicalIndex,
        arr_len,
        head,
      );

      expect(result).toEqual(
        (logicalIndex + head - arr_len) % arr_len,
      );
    });
  });

  describe('getLogicalOrder', () => {
    it('should get the logical order', () => {
      const arr = [1, 2, 3];
      const head = 0;

      const expectedArray = [1, 2, 3];

      jest
        .spyOn(service, 'getLogicalIndex')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(2);

      const result = service.getLogicalOrder(
        arr,
        head,
      );

      expect(result).toEqual(expectedArray);
      expect(
        service.getLogicalIndex,
      ).toHaveBeenCalledWith(0, head, arr.length);
    });
  });

  describe('pruneEmptySnapshots', () => {
    it('should prune empty snapshots', () => {
      const snapshots = [new SnapshotDTO()];

      const result =
        service.pruneEmptySnapshots(snapshots);

      expect(result).toEqual([]);
    });
  });

  describe('getHistorySet', () => {
    it('should get the history set', async () => {
      const diffDTO = new DiffDTO();
      diffDTO.S3DiffIndex = 1;

      const versionSetDTO = new VersionSetDTO();
      versionSetDTO.DiffHistory = [diffDTO];
      versionSetDTO.UserID = 0;
      versionSetDTO.MarkdownID = 'test';

      const previousSnapshotDTO =
        new SnapshotDTO();

      const s3DiffIndices = [1];

      const expectedVersionHistoryDTO =
        new VersionHistoryDTO();

      expectedVersionHistoryDTO.DiffHistory = [
        diffDTO,
      ];
      expectedVersionHistoryDTO.SnapshotHistory =
        [previousSnapshotDTO];

      jest
        .spyOn(s3Service, 'getDiffSet')
        .mockResolvedValueOnce([diffDTO]);

      jest
        .spyOn(service, 'getPreviousSnapshot')
        .mockResolvedValueOnce(
          previousSnapshotDTO,
        );

      const result = await service.getHistorySet(
        versionSetDTO,
      );

      expect(result).toEqual(
        expectedVersionHistoryDTO,
      );
      expect(
        s3Service.getDiffSet,
      ).toHaveBeenCalledWith(
        s3DiffIndices,
        versionSetDTO.UserID,
        versionSetDTO.MarkdownID,
      );
      expect(
        service.getPreviousSnapshot,
      ).toHaveBeenCalledWith(versionSetDTO);
    });
  });
});
