import { Injectable } from '@nestjs/common';
import { Asset } from './entities/asset.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { ImageDTO } from 'src/image_manager/dto/image.dto';
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
    uploadAssetDto: ImageDTO,
  ): Promise<Asset> {
    const newAssetDto = new AssetDTO();
    newAssetDto.AssetID = 0; // auto-incremented value 0 is ignored by the database
    newAssetDto.Format = 'image';
    newAssetDto.FileName =
      uploadAssetDto.FileName;
    newAssetDto.ConvertedElement = 'null';
    newAssetDto.Image = 'null';
    newAssetDto.DateCreated = new Date();
    newAssetDto.Size =
      uploadAssetDto.Content.length;
    newAssetDto.ParentFolderID = '0';
    newAssetDto.UserID = 6;
    const newAsset =
      this.assetsRepository.create(newAssetDto);
    return this.assetsRepository.save(newAsset);
  }

  retrieveAll() {
    return this.assetsRepository.find(); // SELECT * FROM assets;
  }
}
