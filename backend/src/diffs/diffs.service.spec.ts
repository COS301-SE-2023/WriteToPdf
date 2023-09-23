import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { DiffsService } from './diffs.service';
import { Diff } from './entities/diffs.entity';
import { DiffDTO } from './dto/diffs.dto';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  isWithinInterval,
  subMilliseconds,
  addMilliseconds,
} from 'date-fns';
import * as CryptoJS from 'crypto-js';

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

describe('DiffService', () => {
  let service: DiffsService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          DiffsService,
          {
            provide: getRepositoryToken(Diff),
            useClass: Repository,
          },
        ],
      }).compile();

    service =
      module.get<DiffsService>(DiffsService);
  });

  describe('getDiff', () => {
    it('should return a diff', async () => {
      const diffDTO = new DiffDTO();
      diffDTO.MarkdownID = '0';

      const nextDiffIndex = 0;

      const returnedDiff = new Diff();
      returnedDiff.DiffID = '0';

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValueOnce(returnedDiff);

      const result = await service.getDiff(
        diffDTO,
        nextDiffIndex,
      );

      expect(result).toEqual(returnedDiff);
      expect(
        Repository.prototype.findOne,
      ).toBeCalledWith({
        where: {
          MarkdownID: diffDTO.MarkdownID,
          S3DiffIndex: nextDiffIndex,
        },
      });
    });
  });

  describe('updateDiff', () => {
    it('should update a diff', async () => {
      const diffDTO = new DiffDTO();
      diffDTO.MarkdownID = '0';

      const nextDiffIndex = 0;

      const returnedDiff = new Diff();
      returnedDiff.DiffID = '0';

      const updatedDiff = new Diff();
      updatedDiff.DiffID = '0';
      updatedDiff.HasBeenUsed = true;
      updatedDiff.LastModified = expect.any(Date);

      jest
        .spyOn(service, 'getDiff')
        .mockResolvedValueOnce(returnedDiff);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValue(updatedDiff);

      await service.updateDiff(
        diffDTO,
        nextDiffIndex,
      );

      expect(
        Repository.prototype.save,
      ).toBeCalledWith(updatedDiff);
    });
  });

  describe('createDiff', () => {
    it('should create a diff', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.UserID = 0;
      markdownFileDTO.MarkdownID = '0';
      markdownFileDTO.NextDiffIndex = 0;

      const snapshotID = '0';

      jest
        .spyOn(Repository.prototype, 'insert')
        .mockResolvedValueOnce(undefined);

      await service.createDiff(
        markdownFileDTO,
        snapshotID,
      );

      expect(
        Repository.prototype.insert,
      ).toBeCalledWith({
        DiffID: 'hashed string',
        MarkdownID: markdownFileDTO.MarkdownID,
        UserID: markdownFileDTO.UserID,
        S3DiffIndex:
          markdownFileDTO.NextDiffIndex,
        HasBeenUsed: false,
        SnapshotID: snapshotID,
      });
    });
  });

  describe('deleteDiffs', () => {
    it('should delete diffs', async () => {
      const markdownDTO = new MarkdownFileDTO();
      markdownDTO.MarkdownID = '0';

      jest
        .spyOn(Repository.prototype, 'delete')
        .mockResolvedValueOnce(undefined);

      await service.deleteDiffs(markdownDTO);

      expect(
        Repository.prototype.delete,
      ).toBeCalledWith({
        MarkdownID: markdownDTO.MarkdownID,
      });
    });
  });

  describe('resetDiffs', () => {
    it('should update diffs', async () => {
      const markdownID = '0';
      const snapshotID = '0';

      jest
        .spyOn(Repository.prototype, 'update')
        .mockResolvedValueOnce(undefined);

      await service.resetDiffs(
        markdownID,
        snapshotID,
      );

      expect(
        Repository.prototype.update,
      ).toBeCalledWith(
        {
          MarkdownID: markdownID,
          SnapshotID: snapshotID,
        },
        {
          HasBeenUsed: false,
        },
      );
    });
  });

  describe('getAllDiffs', () => {
    it('should find all diffs', async () => {
      const markdownID = '0';

      const returnedDiffs = [
        new Diff(),
        new Diff(),
      ];

      jest
        .spyOn(Repository.prototype, 'find')
        .mockResolvedValueOnce(returnedDiffs);

      const result = await service.getAllDiffs(
        markdownID,
      );

      expect(result).toEqual(returnedDiffs);
    });
  });

  describe('getLogicalIndex', () => {
    it('should return a logical index', () => {
      const s3Index = 0;
      const nextDiffID = 0;
      const arr_len = 0;

      const result = service.getLogicalIndex(
        s3Index,
        nextDiffID,
        arr_len,
      );

      expect(result).toBe(
        (s3Index - nextDiffID + arr_len) %
          arr_len,
      );
    });
  });
});
