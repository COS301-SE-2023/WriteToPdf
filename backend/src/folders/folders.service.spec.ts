import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { FoldersService } from './folders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Any, Repository } from 'typeorm';
import { Folder } from './entities/folder.entity';
import { FolderDTO } from './dto/folder.dto';
import * as CryptoJS from 'crypto-js';

jest.mock('crypto-js', () => {
  const mockedHash = jest.fn(() => 'mockedHash');

  return {
    SHA256: jest.fn().mockReturnValue({
      toString: mockedHash,
    }),
  };
});

describe('FoldersService', () => {
  let service: FoldersService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          FoldersService,
          {
            provide: getRepositoryToken(Folder),
            useClass: Repository,
          },
        ],
      }).compile();

    service = module.get<FoldersService>(
      FoldersService,
    );
  });

  describe('findAllByUserID', () => {
    it('should return an array of folders', async () => {
      const folder1 = new Folder();
      folder1.FolderID = '1';
      folder1.FolderName = 'folder1';
      folder1.UserID = 1;

      const folder2 = new Folder();
      folder2.FolderID = '2';
      folder2.FolderName = 'folder2';
      folder2.UserID = 1;

      const result = [folder1, folder2];
      jest
        .spyOn(Repository.prototype, 'find')
        .mockResolvedValue(result);

      expect(
        await service.findAllByUserID(1),
      ).toBe(result);
      expect(
        Repository.prototype.find,
      ).toBeCalled();
    });
  });

  describe('create', () => {
    it('should generate a folderID and save to the database', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.UserID = 1;

      const expectedDTO = new FolderDTO();
      expectedDTO.UserID = 1;
      expectedDTO.FolderID = 'mockedHash';

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValue(expectedDTO);

      const result = service.create(folderDTO);

      expect(CryptoJS.SHA256).toHaveBeenCalled();
      expect(
        Repository.prototype.save,
      ).toBeCalledWith(expectedDTO);
    });

    it('should return a new FolderDTO', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.UserID = 1;

      const expectedDTO = new FolderDTO();
      expectedDTO.UserID = 1;
      expectedDTO.FolderID = 'mockedHash';

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValue(expectedDTO);

      const result = await service.create(
        folderDTO,
      );

      expect(result).toBe(expectedDTO);
    });
  });

  describe('updateName', () => {
    it('should find the folder and update the name', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.FolderID = '1';
      folderDTO.FolderName = 'newName';

      const folder = new FolderDTO();
      folder.FolderID = '1';
      folder.FolderName = 'oldName';

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValue(folderDTO);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValue(folder);

      const result = await service.updateName(
        folderDTO,
      );

      expect(result).toBe(folder);
      expect(
        Repository.prototype.findOne,
      ).toBeCalledWith({
        where: {
          FolderID: folderDTO.FolderID,
        },
      });
      expect(
        Repository.prototype.save,
      ).toBeCalled();
    });
  });

  describe('remove', () => {
    it('should find the folder and remove it', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.FolderID = '1';

      const folder = new Folder();
      folder.FolderID = '1';
      folder.UserID = 1;

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValue(folder);

      jest
        .spyOn(Repository.prototype, 'remove')
        .mockResolvedValue(folder);

      const result = await service.remove(
        folderDTO,
      );

      expect(result).toBe(folder);
      expect(
        Repository.prototype.findOne,
      ).toBeCalledWith({
        where: {
          FolderID: folderDTO.FolderID,
        },
      });
      expect(
        Repository.prototype.remove,
      ).toBeCalledWith(folder);
    });
  });

  describe('updatePath', () => {
    it('should find the folder and update the path', async () => {
      const folderDTO = new FolderDTO();
      folderDTO.FolderID = '1';
      folderDTO.Path = 'newPath';

      const folder = new FolderDTO();
      folder.FolderID = '1';
      folder.Path = 'oldPath';

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValue(folderDTO);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValue(folder);

      const result = await service.updatePath(
        folderDTO,
      );

      expect(result).toBe(folder);
      expect(
        Repository.prototype.findOne,
      ).toBeCalledWith({
        where: {
          FolderID: folderDTO.FolderID,
        },
      });
      expect(
        Repository.prototype.save,
      ).toBeCalled();
    });
  });
});
