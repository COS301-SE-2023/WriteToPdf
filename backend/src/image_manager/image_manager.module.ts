import { Module } from '@nestjs/common';
import { ImageManagerService } from './image_manager.service';
import { ImageManagerController } from './image_manager.controller';
import { S3Service } from '../s3/s3.service';

@Module({
  controllers: [ImageManagerController],
  providers: [ImageManagerService, S3Service],
})
export class ImageManagerModule {}
