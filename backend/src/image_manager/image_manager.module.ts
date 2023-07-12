import { Module } from '@nestjs/common';
import { ImageManagerService } from './image_manager.service';
import { ImageManagerController } from './image_manager.controller';

@Module({
  controllers: [ImageManagerController],
  providers: [ImageManagerService],
})
export class ImageManagerModule {}
