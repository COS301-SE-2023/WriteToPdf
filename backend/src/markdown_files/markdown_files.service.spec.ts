import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { MarkdownFilesService } from './markdown_files.service';
import { MarkdownFile } from './entities/markdown_file.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarkdownFileDTO } from './dto/markdown_file.dto';

describe('MarkdownFilesService', () => {
  let service: MarkdownFilesService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          MarkdownFilesService,
          {
            provide:
              getRepositoryToken(MarkdownFile),
            useClass: Repository,
          },
        ],
      }).compile();

    service = module.get<MarkdownFilesService>(
      MarkdownFilesService,
    );
  });

  describe('create', () => {
    it('should create a markdown file', async () => {
      const markdownFile = new MarkdownFileDTO();
      markdownFile.MarkdownID = '1';
      markdownFile.Name = 'markdownFile1';
      markdownFile.Path = 'path1';
      markdownFile.ParentFolderID = '1';

      const createdMakdownFile =
        new MarkdownFile();
      createdMakdownFile.MarkdownID =
        markdownFile.MarkdownID;
      createdMakdownFile.Name = markdownFile.Name;
      createdMakdownFile.Path = markdownFile.Path;
      createdMakdownFile.DateCreated = new Date();
      createdMakdownFile.LastModified =
        new Date();
      createdMakdownFile.Size = 0;
      createdMakdownFile.ParentFolderID =
        markdownFile.ParentFolderID;

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValue(createdMakdownFile);

      const result = await service.create(
        markdownFile,
      );

      expect(result).toBe(createdMakdownFile);
      expect(
        Repository.prototype.save,
      ).toBeCalledWith(markdownFile);
    });
  });

  describe('updateName', () => {
    it('should find the markdown file and update the name', async () => {
      const markdownFile = new MarkdownFileDTO();
      markdownFile.MarkdownID = '1';
      markdownFile.Name = 'oldName';
      markdownFile.Path = 'path1';

      const updatedMarkdownFile =
        new MarkdownFileDTO();
      updatedMarkdownFile.MarkdownID = '1';
      updatedMarkdownFile.Name = 'newName';
      updatedMarkdownFile.Path = 'path1';

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValue(markdownFile);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValue(updatedMarkdownFile);

      const result = await service.updateName(
        markdownFile,
      );

      expect(result).toBe(updatedMarkdownFile);
      expect(
        Repository.prototype.findOne,
      ).toBeCalledWith({
        where: {
          MarkdownID: markdownFile.MarkdownID,
        },
      });
      expect(
        Repository.prototype.save,
      ).toBeCalled();
    });
  });

  describe('updatePath', () => {
    it('should find the markdown file and update the path', async () => {
      const markdownFile = new MarkdownFileDTO();
      markdownFile.MarkdownID = '1';
      markdownFile.Name = 'markdownFile1';
      markdownFile.Path = 'oldPath';
      markdownFile.ParentFolderID =
        'oldParentFolderID';

      const updatedMarkdownFile =
        new MarkdownFileDTO();
      updatedMarkdownFile.MarkdownID = '1';
      updatedMarkdownFile.Name = 'markdownFile1';
      updatedMarkdownFile.Path = 'newPath';
      updatedMarkdownFile.ParentFolderID =
        'newParentFolderID';

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValue(markdownFile);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockImplementation((markdownFile) => {
          return markdownFile;
        });

      const result = await service.updatePath(
        updatedMarkdownFile,
      );

      expect(result).toStrictEqual(
        updatedMarkdownFile,
      );
      expect(
        Repository.prototype.findOne,
      ).toBeCalledWith({
        where: {
          MarkdownID: markdownFile.MarkdownID,
        },
      });
      expect(
        Repository.prototype.save,
      ).toBeCalled();
    });
  });

  describe('remove', () => {
    it('should remove a markdown file', async () => {
      const markdownFile = new MarkdownFileDTO();
      markdownFile.MarkdownID = '1';

      jest
        .spyOn(Repository.prototype, 'delete')
        .mockResolvedValue(null);

      const result = await service.remove(
        markdownFile,
      );

      expect(result).toBe(null);
      expect(
        Repository.prototype.delete,
      ).toBeCalledWith({
        MarkdownID: markdownFile.MarkdownID,
      });
    });
  });

  describe('findAllByUserID', () => {
    it('should return an array of markdown files', async () => {
      const markdownFile1 = new MarkdownFileDTO();
      markdownFile1.MarkdownID = '1';
      markdownFile1.Name = 'markdownFile1';
      markdownFile1.Path = 'path1';

      const markdownFile2 = new MarkdownFileDTO();
      markdownFile2.MarkdownID = '2';
      markdownFile2.Name = 'markdownFile2';
      markdownFile2.Path = 'path2';

      const markdownFiles = [
        markdownFile1,
        markdownFile2,
      ];

      jest
        .spyOn(Repository.prototype, 'find')
        .mockResolvedValue(markdownFiles);

      const result =
        await service.findAllByUserID(1);

      expect(result).toBe(markdownFiles);
      expect(
        Repository.prototype.find,
      ).toBeCalledWith({
        where: {
          UserID: 1,
        },
      });
    });
  });

  describe('updateAfterModification', () => {
    it('should find the markdown file and update the last modified', async () => {
      const markdownFile = new MarkdownFileDTO();
      markdownFile.MarkdownID = '1';
      markdownFile.LastModified = new Date();

      const updatedMarkdownFile =
        new MarkdownFileDTO();
      updatedMarkdownFile.MarkdownID = '1';
      updatedMarkdownFile.LastModified =
        new Date();

      jest
        .spyOn(Repository.prototype, 'findOneBy')
        .mockResolvedValue(markdownFile);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValue(updatedMarkdownFile);

      const result =
        await service.updateAfterModification(
          markdownFile,
        );

      expect(result).toBe(updatedMarkdownFile);
      expect(
        Repository.prototype.findOneBy,
      ).toBeCalledWith({
        MarkdownID: markdownFile.MarkdownID,
      });
      expect(
        Repository.prototype.save,
      ).toBeCalled();
    });
  });

  describe('updateSafeLockStatus', () => {
    it('should throw error if markdown file not found in database', async () => {
      const markdownFile = new MarkdownFileDTO();
      markdownFile.MarkdownID = '1';
      markdownFile.SafeLock = true;

      jest
        .spyOn(Repository.prototype, 'findOneBy')
        .mockResolvedValue(null);

      await expect(
        service.updateSafeLockStatus(
          markdownFile,
        ),
      ).rejects.toThrow(
        'Markdown file not found',
      );
    });

    it('should find the markdown file and update the safe lock status', async () => {
      const markdownFile = new MarkdownFileDTO();
      markdownFile.MarkdownID = '1';
      markdownFile.SafeLock = true;

      const updatedMarkdownFile =
        new MarkdownFileDTO();
      updatedMarkdownFile.MarkdownID = '1';
      updatedMarkdownFile.SafeLock = true;

      jest
        .spyOn(Repository.prototype, 'findOneBy')
        .mockResolvedValue(markdownFile);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValue(updatedMarkdownFile);

      const result =
        await service.updateSafeLockStatus(
          markdownFile,
        );

      expect(result).toBe(updatedMarkdownFile);
      expect(
        Repository.prototype.findOneBy,
      ).toBeCalledWith({
        MarkdownID: markdownFile.MarkdownID,
      });
      expect(
        Repository.prototype.save,
      ).toBeCalled();
    });
  });

  describe('getNextDiffID', () => {
    it('should find the markdown file and return the next diff id', async () => {
      const markdownFile = new MarkdownFileDTO();
      markdownFile.MarkdownID = '1';
      markdownFile.NextDiffIndex = 0;

      jest
        .spyOn(Repository.prototype, 'findOneBy')
        .mockResolvedValue(markdownFile);

      const result = await service.getNextDiffID(
        '1',
      );

      expect(result).toBe(0);
      expect(
        Repository.prototype.findOneBy,
      ).toBeCalledWith({
        MarkdownID: '1',
      });
    });
  });

  describe('getNextSnapshotID', () => {
    it('should find the markdown file and return the next snapshot id', async () => {
      const markdownFile = new MarkdownFileDTO();
      markdownFile.MarkdownID = '1';
      markdownFile.NextSnapshotIndex = 0;

      jest
        .spyOn(Repository.prototype, 'findOneBy')
        .mockResolvedValue(markdownFile);

      const result =
        await service.getNextSnapshotID('1');

      expect(result).toBe(0);
      expect(
        Repository.prototype.findOneBy,
      ).toBeCalledWith({
        MarkdownID: '1',
      });
    });
  });

  describe('incrementNextDiffID', () => {
    it('should find the markdown file and increment the next diff id', async () => {
      const markdownID = '1';

      const foundMarkdownFile =
        new MarkdownFile();
      foundMarkdownFile.MarkdownID = markdownID;
      foundMarkdownFile.NextDiffIndex = 0;

      jest
        .spyOn(Repository.prototype, 'findOneBy')
        .mockResolvedValue(foundMarkdownFile);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockImplementation((markdownFile) => {
          return markdownFile;
        });

      const result =
        await service.incrementNextDiffID(
          markdownID,
        );

      expect(result.NextDiffIndex).toEqual(1);
      expect(
        Repository.prototype.findOneBy,
      ).toBeCalledWith({
        MarkdownID: markdownID,
      });
      expect(
        Repository.prototype.save,
      ).toBeCalled();
    });
  });

  describe('getTotalNumDiffs', () => {
    it('should find the markdown file and return the total number of diffs', async () => {
      const markdownID = '1';

      const foundMarkdownFile =
        new MarkdownFile();
      foundMarkdownFile.MarkdownID = markdownID;
      foundMarkdownFile.TotalNumDiffs = 1;

      jest
        .spyOn(Repository.prototype, 'findOneBy')
        .mockResolvedValue(foundMarkdownFile);

      const result =
        await service.getTotalNumDiffs(
          markdownID,
        );

      expect(result).toEqual(1);
    });
  });

  describe('getTotalNumSnapshots', () => {
    it('should find the markdown file and return the total number of snapshots', async () => {
      const markdownID = '1';

      const foundMarkdownFile =
        new MarkdownFile();
      foundMarkdownFile.MarkdownID = markdownID;
      foundMarkdownFile.TotalNumSnapshots = 1;

      jest
        .spyOn(Repository.prototype, 'findOneBy')
        .mockResolvedValue(foundMarkdownFile);

      const result =
        await service.getTotalNumSnapshots(
          markdownID,
        );

      expect(result).toEqual(1);
    });
  });

  describe('incrementTotalNumDiffs', () => {
    it('should find the markdown file and increment the total number of diffs', async () => {
      const markdownID = '1';

      const foundMarkdownFile =
        new MarkdownFile();
      foundMarkdownFile.MarkdownID = markdownID;
      foundMarkdownFile.TotalNumDiffs = 1;

      jest
        .spyOn(Repository.prototype, 'findOneBy')
        .mockResolvedValue(foundMarkdownFile);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockImplementation((markdownFile) => {
          return markdownFile;
        });

      const result =
        await service.incrementTotalNumDiffs(
          markdownID,
        );

      expect(result.TotalNumDiffs).toEqual(2);
      expect(
        Repository.prototype.findOneBy,
      ).toBeCalledWith({
        MarkdownID: markdownID,
      });
      expect(
        Repository.prototype.save,
      ).toBeCalled();
    });
  });
});
