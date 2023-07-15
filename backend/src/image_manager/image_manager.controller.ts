import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ImageManagerService } from './image_manager.service';
import { ImageDTO } from './dto/image.dto';
import { RetrieveAllImagesDTO } from './dto/retrieve_all_images.dto';
import { AssetDTO } from 'src/assets/dto/asset.dto';

@Controller('image_manager')
export class ImageManagerController {
  constructor(
    private readonly imageManagerService: ImageManagerService,
  ) {}

  @Post('upload')
  upload(
    @Body()
    uploadImageDto: ImageDTO,
  ) {
    return this.imageManagerService.upload(
      uploadImageDto,
    );
  }

  @Post('retrieve_all')
  retrieveAll(
    @Body()
    retrieveAllImagesDto: RetrieveAllImagesDTO,
  ) {
    return this.imageManagerService.retrieveAll(
      retrieveAllImagesDto,
    );
  }

  @Post('retrieve_image')
  retrieveImage(
    @Body()
    retrieveAssetDto: AssetDTO,
  ) {
    return this.imageManagerService.retrieveOne(
      retrieveAssetDto,
    );
  }

  @Post()
  create(
    @Body()
    createImageManagerDto: ImageDTO,
  ) {
    return this.imageManagerService.create(
      createImageManagerDto,
    );
  }

  @Get()
  findAll() {
    return this.imageManagerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imageManagerService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateImageManagerDto: ImageDTO,
  ) {
    return this.imageManagerService.update(
      +id,
      updateImageManagerDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imageManagerService.remove(+id);
  }
}
