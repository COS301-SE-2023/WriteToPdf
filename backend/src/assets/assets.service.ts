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

  // findRecent(): Promise<Asset[]> {
  //   const response = this.assetsRepository.find(); // SELECT * FROM assets;
  //   response = response.orderby('DateCreated', 'DESC');
  //   return response;
  // }

  saveImage(
    uploadAssetDTO: AssetDTO,
  ): Promise<Asset> {
    uploadAssetDTO.Format = 'image';
    uploadAssetDTO.DateCreated = new Date();
    uploadAssetDTO.Size =
      uploadAssetDTO.Content.length;
    uploadAssetDTO.Image = '<placeholder>';
    // uploadAssetDTO.ParentFolderID = '1';
    uploadAssetDTO.ConvertedElement =
      '<placeholder>';
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
    uploadTextDTO.Format = 'text';
    uploadTextDTO.DateCreated = new Date();
    uploadTextDTO.Size =
      uploadTextDTO.Content.length;
    uploadTextDTO.Image = '<placeholder>';
    // uploadTextDTO.ParentFolderID = '1';
    uploadTextDTO.ConvertedElement =
      '<placeholder>';
    const newAsset = this.assetsRepository.create(
      uploadTextDTO,
    );
    return this.assetsRepository.save(newAsset);
  }

  retrieveAllAssets(
    retrieveAllDTO: RetrieveAllDTO,
  ) {
    // SELECT * FROM ASSETS
    // WHERE UserID = retrieveAllImagesDTO.UserID
    // and ParentFolderID = retrieveAllImagesDTO.ParentFolderID;
    return this.assetsRepository.find({
      where: {
        UserID: retrieveAllDTO.UserID,
        ParentFolderID:
          retrieveAllDTO.ParentFolderID,
      },
    });
  }

  retrieveAllRootAssets(
    retrieveAllDTO: RetrieveAllDTO,
  ) {
    return this.assetsRepository.find({
      where: {
        UserID: retrieveAllDTO.UserID,
        ParentFolderID: '',
      },
    });
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
