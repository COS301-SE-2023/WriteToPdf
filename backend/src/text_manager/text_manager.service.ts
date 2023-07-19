import { Injectable } from '@nestjs/common';
import { AssetDTO } from '../assets/dto/asset.dto';
import { S3Service } from '../s3/s3.service';
import { AssetsService } from '../assets/assets.service';
import { SHA256 } from 'crypto-js';

@Injectable()
export class TextManagerService {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly s3Service: S3Service,
  ) {}

  upload(uploadTextDTO: AssetDTO) {
    uploadTextDTO.AssetID = SHA256(
      uploadTextDTO.UserID.toString() +
        new Date().getTime().toString(),
    ).toString();

    // Store in database
    this.assetsService.saveText(uploadTextDTO);

    // Preprocess text for storage in the s3
    uploadTextDTO.Content = this.packageTextForS3(
      uploadTextDTO,
    );

    // Store in the S3
    return this.s3Service.saveAsset(
      uploadTextDTO,
    );
  }

  packageTextForS3(uploadTextDTO: AssetDTO) {
    let newContent = '';
    newContent += uploadTextDTO.Content.length;
    newContent += '\n';
    newContent += uploadTextDTO.Content;
    newContent += uploadTextDTO.Image;
    return newContent;
  }
}
