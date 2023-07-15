import { Injectable } from '@nestjs/common';
import { Asset } from './entities/asset.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { AssetDTO } from './dto/asset.dto';

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

  createImage(
    uploadAssetDTO: AssetDTO,
  ): Promise<Asset> {
    uploadAssetDTO.Format = 'image';
    uploadAssetDTO.DateCreated = new Date();
    uploadAssetDTO.Size =
      uploadAssetDTO.Content.length;
    uploadAssetDTO.Image = '<placeholder>';
    uploadAssetDTO.ParentFolderID = '1';
    uploadAssetDTO.ConvertedElement =
      '<placeholder>';
    const newAsset = this.assetsRepository.create(
      uploadAssetDTO,
    );
    return this.assetsRepository.save(newAsset);
  }

  retrieveAll() {
    return this.assetsRepository.find(); // SELECT * FROM assets;
  }
}
