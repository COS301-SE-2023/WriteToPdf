import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AssetsService } from './assets.service';
import { Repository } from 'typeorm/repository/Repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AssetDTO } from './dto/asset.dto';
import { RetrieveAllDTO } from '../asset_manager/dto/retrieve_all.dto';

describe('AssetsService', () => {
  let service: AssetsService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          AssetsService,
          {
            provide: getRepositoryToken(Asset),
            useClass: Repository,
          },
          AuthService,
          JwtService,
        ],
      }).compile();

    service = module.get<AssetsService>(
      AssetsService,
    );
  });

  describe('saveAsset', () => {
    it('should initialize DateCreated and Size', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.Content = 'test';

      jest
        .spyOn(Repository.prototype, 'create')
        .mockReturnValue(assetDTO);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValue(assetDTO);

      const result = await service.saveAsset(
        assetDTO,
      );
      expect(result.DateCreated).toBeDefined();
      expect(result.Size).toBe(
        assetDTO.Content.length,
      );
    });

    it('should call create and save', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.Content = 'test';

      jest
        .spyOn(Repository.prototype, 'create')
        .mockReturnValue(assetDTO);

      const saveSpy = jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValue(assetDTO);

      await service.saveAsset(assetDTO);
      expect(saveSpy).toBeCalledWith(assetDTO);
    });
  });

  describe('retrieveOne', () => {
    it('should call findOne', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = 'test';
      assetDTO.Format = 'test';

      const findOneSpy = jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValue(assetDTO);

      const result = await service.retrieveOne(
        assetDTO,
      );

      expect(result).toBe(assetDTO);
      expect(findOneSpy).toBeCalledWith({
        where: {
          AssetID: assetDTO.AssetID,
          Format: assetDTO.Format,
        },
      });
    });
  });

  describe('retrieveAllAssets', () => {
    it('should call createQueryBuilder', async () => {
      const retrieveAllDTO = new RetrieveAllDTO();
      retrieveAllDTO.UserID = 1;
      retrieveAllDTO.ParentFolderID = 'test';

      const createQueryBuilderSpy = jest
        .spyOn(
          Repository.prototype,
          'createQueryBuilder',
        )
        .mockReturnValue({
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getMany: jest
            .fn()
            .mockResolvedValue([]),
        } as any);

      await service.retrieveAllAssets(
        retrieveAllDTO,
      );

      expect(createQueryBuilderSpy).toBeCalled();
    });
  });

  describe('removeOne', () => {
    it('should call delete', async () => {
      const assetID = 'test';

      const deleteSpy = jest
        .spyOn(Repository.prototype, 'delete')
        .mockResolvedValue(undefined);

      await service.removeOne(assetID);

      expect(deleteSpy).toBeCalledWith(assetID);
    });
  });

  describe('renameAsset', () => {
    it('should call findOne and save', async () => {
      const assetDTO = new AssetDTO();
      assetDTO.AssetID = 'test';
      assetDTO.FileName = 'New Name';

      jest
        .spyOn(Repository.prototype, 'findOneBy')
        .mockResolvedValue(assetDTO);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValue(assetDTO);

      await service.renameAsset(assetDTO);

      expect(
        Repository.prototype.findOneBy,
      ).toBeCalledWith({
        AssetID: assetDTO.AssetID,
      });
      expect(
        Repository.prototype.save,
      ).toBeCalledWith(assetDTO);
    });

    it('should update the name of the found asset', async () => {
      const updatedAsset = new AssetDTO();
      updatedAsset.AssetID = 'test';
      updatedAsset.FileName = 'New Name';

      const assetDTO = new AssetDTO();
      assetDTO.AssetID = 'test';
      assetDTO.FileName = 'Old Name';

      jest
        .spyOn(Repository.prototype, 'findOneBy')
        .mockResolvedValue(assetDTO);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockImplementation((asset) => {
          return asset;
        });

      const result = await service.renameAsset(
        updatedAsset,
      );

      expect(result.FileName).toBe(
        updatedAsset.FileName,
      );
    });
  });
});
