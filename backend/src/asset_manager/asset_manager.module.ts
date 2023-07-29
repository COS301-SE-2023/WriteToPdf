import { Module } from '@nestjs/common';
import { AssetManagerService } from './asset_manager.service';
import { AssetManagerController } from './asset_manager.controller';
import { ImageManagerService } from '../image_manager/image_manager.service';
import { S3Service } from '../s3/s3.service';
import { Asset } from '../assets/entities/asset.entity';
import { AssetsService } from '../assets/assets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { TextManagerService } from '../text_manager/text_manager.service';
import { TextractService } from 'src/textract/textract.service';

@Module({
  imports: [TypeOrmModule.forFeature([Asset])],
  controllers: [AssetManagerController],
  providers: [
    AssetManagerService,
    ImageManagerService,
    S3Service,
    AssetsService,
    AuthService,
    TextManagerService,
    TextractService,
  ],
})
export class AssetManagerModule {}
