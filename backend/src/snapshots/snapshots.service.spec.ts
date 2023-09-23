import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { SnapshotService } from './snapshots.service';
import { Snapshot } from './entities/snapshots.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import * as CryptoJS from 'crypto-js';
import { SnapshotDTO } from './dto/snapshot.dto';

jest.mock('crypto-js', () => {
  const mockedHash = jest.fn(
    () => 'hashed string',
  );

  return {
    SHA256: jest.fn().mockReturnValue({
      toString: mockedHash,
    }),
  };
});

describe('SnapshotService', () => {
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

  describe('createSnapshot', () => {
    it('should return a snapshotID', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '0';
      markdownFileDTO.UserID = 0;
      markdownFileDTO.NextSnapshotIndex = 0;

      const returnedSnapshot = new Snapshot();
      returnedSnapshot.SnapshotID =
        'hashed string';

      jest
        .spyOn(Repository.prototype, 'insert')
        .mockResolvedValue(undefined);

      const result = await service.createSnapshot(
        markdownFileDTO,
      );

      expect(result).toEqual(
        returnedSnapshot.SnapshotID,
      );
      expect(
        Repository.prototype.insert,
      ).toBeCalledWith({
        SnapshotID: returnedSnapshot.SnapshotID,
        MarkdownID: markdownFileDTO.MarkdownID,
        UserID: markdownFileDTO.UserID,
        S3SnapshotIndex:
          markdownFileDTO.NextSnapshotIndex,
        HasBeenUsed: false,
      });
      expect(CryptoJS.SHA256).toHaveBeenCalled();
    });
  });

  describe('updateSnapshot', () => {
    it('should update the snapshot', async () => {
      const markdownID = '0';
      const nextSnapshotNumber = 0;

      const foundSnapshot = new Snapshot();
      foundSnapshot.SnapshotID = '0';
      foundSnapshot.S3SnapshotIndex = 0;
      foundSnapshot.HasBeenUsed = true;
      foundSnapshot.LastModified =
        expect.any(Date);

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValueOnce(foundSnapshot);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValueOnce(undefined);

      await service.updateSnapshot(
        markdownID,
        nextSnapshotNumber,
      );

      expect(
        Repository.prototype.findOne,
      ).toBeCalledWith({
        where: {
          MarkdownID: markdownID,
          S3SnapshotIndex: nextSnapshotNumber,
        },
      });
      expect(
        Repository.prototype.save,
      ).toBeCalledWith(foundSnapshot);
    });
  });

  describe('getAllSnapshots', () => {
    it('should return all snapshots', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '0';

      const foundSnapshots = [
        new Snapshot(),
        new Snapshot(),
      ];

      jest
        .spyOn(Repository.prototype, 'find')
        .mockResolvedValueOnce(foundSnapshots);

      const result =
        await service.getAllSnapshots(
          markdownFileDTO,
        );

      expect(result).toEqual(foundSnapshots);
      expect(
        Repository.prototype.find,
      ).toBeCalledWith({
        where: {
          MarkdownID: markdownFileDTO.MarkdownID,
          HasBeenUsed: true,
        },
      });
    });
  });

  describe('resetSnapshot', () => {
    it('should reset the snapshot', async () => {
      const markdownID = '0';
      const nextSnapshotIndex = 0;

      const foundSnapshot = new Snapshot();
      foundSnapshot.SnapshotID = '0';
      foundSnapshot.S3SnapshotIndex = 0;
      foundSnapshot.HasBeenUsed = false;

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValueOnce(foundSnapshot);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValueOnce(undefined);

      const result = await service.resetSnapshot(
        markdownID,
        nextSnapshotIndex,
      );

      expect(result).toEqual(foundSnapshot);
      expect(
        Repository.prototype.findOne,
      ).toBeCalledWith({
        where: {
          MarkdownID: markdownID,
          S3SnapshotIndex: nextSnapshotIndex,
        },
      });
      expect(
        Repository.prototype.save,
      ).toBeCalledWith(foundSnapshot);
    });
  });

  describe('getSnapshotByS3SnapshotID', () => {
    it('should return the snapshot', async () => {
      const markdownID = '0';
      const s3SnapshotIndex = 0;

      const foundSnapshot = new Snapshot();

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValueOnce(foundSnapshot);

      const result =
        await service.getSnapshotByS3SnapshotID(
          markdownID,
          s3SnapshotIndex,
        );

      expect(result).toEqual(foundSnapshot);
      expect(
        Repository.prototype.findOne,
      ).toBeCalledWith({
        where: {
          MarkdownID: markdownID,
          S3SnapshotIndex: s3SnapshotIndex,
        },
      });
    });
  });

  describe('getLogicalIndex', () => {
    it('should return the logical index', async () => {
      const s3Index = 0;
      const nextSnapshotID = 0;
      const arr_len = 0;

      const result = service.getLogicalIndex(
        s3Index,
        nextSnapshotID,
        arr_len,
      );

      expect(result).toEqual(
        (s3Index - nextSnapshotID + arr_len) %
          arr_len,
      );
    });
  });

  describe('getSnapshotByID', () => {
    it('should return the snapshot', async () => {
      const snapshotID = '0';

      const foundSnapshot = new Snapshot();

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValueOnce(foundSnapshot);

      const result =
        await service.getSnapshotByID(snapshotID);

      expect(result).toEqual(foundSnapshot);
      expect(
        Repository.prototype.findOne,
      ).toBeCalledWith({
        where: {
          SnapshotID: snapshotID,
        },
      });
    });
  });

  describe('createSnapshots', () => {
    it('should create snapshots', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = '0';
      markdownFileDTO.UserID = 0;
      markdownFileDTO.NextSnapshotIndex = 0;

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValueOnce(undefined);

      const originalMaxSnapshots =
        process.env.MAX_SNAPSHOTS;
      process.env.MAX_SNAPSHOTS = '1';

      try {
        const result =
          await service.createSnapshots(
            markdownFileDTO,
          );

        expect(result).toEqual(expect.any(Array));
        expect(
          Repository.prototype.save,
        ).toBeCalledWith(expect.any(Object));
      } finally {
        process.env.MAX_SNAPSHOTS =
          originalMaxSnapshots;
      }
    });
  });

  describe('getLogicalSnapshotOrder', () => {
    it('should return the logical snapshot order', async () => {
      const snapshotDTO1 = new SnapshotDTO();
      snapshotDTO1.S3SnapshotIndex = 0;

      const snapshotDTO2 = new SnapshotDTO();
      snapshotDTO2.S3SnapshotIndex = 1;

      const snapshotDTOs = [
        snapshotDTO1,
        snapshotDTO2,
      ];

      const nextDiffID = 2;

      const originalMaxDiffs =
        process.env.MAX_DIFFS;
      process.env.MAX_DIFFS = '1';

      try {
        const result =
          await service.getLogicalSnapshotOrder(
            snapshotDTOs,
            nextDiffID,
          );

        expect(result).toEqual(expect.any(Array));
      } finally {
        process.env.MAX_DIFFS = originalMaxDiffs;
      }
    });
  });
});
