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
  isAfter,
  subMilliseconds,
} from 'date-fns'; // or any date manipulation library you prefer

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
      updatedDiff.LastModified = new Date();

      jest
        .spyOn(service, 'getDiff')
        .mockResolvedValueOnce(returnedDiff);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockImplementationOnce((diff) => {
          const threshold = 1000;
          const isDateCloseEnough = isAfter(
            diff.LastModified,
            subMilliseconds(
              new Date(),
              threshold,
            ),
          );
          expect(isDateCloseEnough).toBe(true);
          return Promise.resolve(diff);
        });

      await service.updateDiff(
        diffDTO,
        nextDiffIndex,
      );

      expect(
        Repository.prototype.save,
      ).toBeCalledWith(updatedDiff);
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
});
