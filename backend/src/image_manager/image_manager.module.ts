import { Module } from '@nestjs/common';
import { ImageManagerService } from './image_manager.service';
// import { ImageManagerController } from './image_manager.controller';
import { S3Service } from '../s3/s3.service';
import { AssetsService } from '../assets/assets.service';
import { Asset } from '../assets/entities/asset.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Asset])],
  // controllers: [ImageManagerController],
  providers: [
    ImageManagerService,
    S3Service,
    AssetsService,
    AuthService,
  ],
})
export class ImageManagerModule {}
