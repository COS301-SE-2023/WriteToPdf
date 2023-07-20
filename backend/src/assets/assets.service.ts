import { Injectable } from '@nestjs/common';
import { Asset } from './entities/asset.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { AssetDTO } from './dto/asset.dto';
import { RetrieveAllDTO } from '../asset_manager/dto/retrieve_all.dto';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private assetsRepository: Repository<Asset>,
    private authService: AuthService,
  ) {}

  saveAsset(uploadAssetDTO: AssetDTO) {
    uploadAssetDTO.DateCreated = new Date();
    uploadAssetDTO.Size =
      uploadAssetDTO.Content.length;
    const newAsset = this.assetsRepository.create(
      uploadAssetDTO,
    );
    return this.assetsRepository.save(newAsset);
  }

  retrieveOne(retrieveAssetDTO: AssetDTO) {
    return this.assetsRepository.findOne({
      where: {
        AssetID: retrieveAssetDTO.AssetID,
        Format: retrieveAssetDTO.Format,
      },
    }); // SELECT * FROM assets WHERE AssetID = retrieveAssetDTO.AssetID;
  }

  async retrieveAllAssets(
    retrieveAllDTO: RetrieveAllDTO,
  ) {
    return await this.assetsRepository
      .createQueryBuilder('asset')
      .where('asset.UserID = :UserID', {
        UserID: retrieveAllDTO.UserID,
      })
      .andWhere(
        "(asset.ParentFolderID = :ParentFolderID OR asset.ParentFolderID = '')",
        {
          ParentFolderID:
            retrieveAllDTO.ParentFolderID,
        },
      )
      .orderBy('asset.DateCreated', 'DESC') // Sort by DateCreated in descending order
      .getMany();
  }

  removeOne(assetID: string) {
    return this.assetsRepository.delete(assetID); // DELETE FROM assets WHERE AssetID = assetID;
  }

  async renameAsset(updatedAssetDTO: AssetDTO) {
    const asset =
      await this.assetsRepository.findOneBy({
        AssetID: updatedAssetDTO.AssetID,
      });
    asset.FileName = updatedAssetDTO.FileName;
    return this.assetsRepository.save(asset);
  }
}
