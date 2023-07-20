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

  saveImage(uploadAssetDTO: AssetDTO) {
    uploadAssetDTO.Format = 'image';
    uploadAssetDTO.DateCreated = new Date();
    uploadAssetDTO.Size =
      uploadAssetDTO.Content.length;
    uploadAssetDTO.Image = '';
    uploadAssetDTO.ConvertedElement = '';
    const newAsset = this.assetsRepository.create(
      uploadAssetDTO,
    );
    return this.assetsRepository.save(newAsset);
  }

  retrieveOne(retrieveAssetDTO: AssetDTO) {
    return this.assetsRepository.findOne({
      where: {
        AssetID: retrieveAssetDTO.AssetID,
      },
    }); // SELECT * FROM assets WHERE AssetID = retrieveAssetDTO.AssetID;
  }

  saveText(uploadTextDTO: AssetDTO) {
    uploadTextDTO.DateCreated = new Date();
    uploadTextDTO.Size =
      uploadTextDTO.Content.length;
    // uploadTextDTO.ParentFolderID = '1';
    uploadTextDTO.ConvertedElement =
      '<placeholder>';
    const newAsset = this.assetsRepository.create(
      uploadTextDTO,
    );
    return this.assetsRepository.save(newAsset);
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
