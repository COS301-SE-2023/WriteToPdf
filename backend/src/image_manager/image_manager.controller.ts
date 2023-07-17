import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ImageManagerService } from './image_manager.service';
import { ImageDTO } from './dto/image.dto';
import { RetrieveAllImagesDTO } from './dto/retrieve_all_images.dto';
import { AssetDTO } from 'src/assets/dto/asset.dto';
import { Asset } from 'src/assets/entities/asset.entity';

@Controller('image_manager')
export class ImageManagerController {
  constructor(
    private readonly imageManagerService: ImageManagerService,
  ) {}

  @Post('upload')
  upload(
    @Body()
    uploadImageDto: AssetDTO,
  ) {
    return this.imageManagerService.upload(
      uploadImageDto,
    );
  }

  @Post('retrieve_all')
  async retrieveAll(
    @Body()
    retrieveAllImagesDto: RetrieveAllImagesDTO,
  ) {
    // Get images from database
    const images =
      await this.imageManagerService.retrieveAll(
        retrieveAllImagesDto,
      );

    // Get base64 string of each image from s3
    for (let i = 0; i < images.length; i++) {
      // Get the base64 string of the image

      const assetDTO = new AssetDTO();
      assetDTO.AssetID = images[i].AssetID;
      assetDTO.UserID = images[i].UserID;
      const asset =
        await this.imageManagerService.retrieveOne(
          assetDTO,
        );

      images[i].Image =
        await this.imageManagerService.compressImage(
          asset.Content,
        );
    }

    // return text snippet in place of a thumbnail

    return images;
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

  @Post('delete_image')
  @HttpCode(HttpStatus.OK)
  deleteFile(
    @Body()
    removeImageDTO: AssetDTO,
  ) {
    if (
      !removeImageDTO.UserID ||
      !removeImageDTO.AssetID
    )
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.imageManagerService.deleteAsset(
      removeImageDTO,
    );
  }

  @Post('rename_image')
  @HttpCode(HttpStatus.OK)
  renameImage(
    @Body()
    renameImageDTO: AssetDTO,
  ) {
    if (
      !renameImageDTO.UserID ||
      !renameImageDTO.AssetID ||
      !renameImageDTO.FileName
    )
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.imageManagerService.renameAsset(
      renameImageDTO,
    );
  }

  // @Post()
  // create(
  //   @Body()
  //   createImageManagerDto: ImageDTO,
  // ) {
  //   return this.imageManagerService.create(
  //     createImageManagerDto,
  //   );
  // }

  // @Get()
  // findAll() {
  //   return this.imageManagerService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.imageManagerService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body()
  //   updateImageManagerDto: ImageDTO,
  // ) {
  //   return this.imageManagerService.update(
  //     +id,
  //     updateImageManagerDto,
  //   );
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.imageManagerService.remove(+id);
  // }
}
