import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AssetManagerService } from './asset_manager.service';
import { AssetDTO } from '../assets/dto/asset.dto';

@Controller('asset_manager')
export class AssetManagerController {
  constructor(
    private readonly assetManagerService: AssetManagerService,
  ) {}

  @Post('upload_image')
  upload_image(
    @Body()
    uploadImageDTO: AssetDTO,
  ) {
    return this.assetManagerService.upload_image(
      uploadImageDTO,
    );
  }

  // @Get()
  // findAll('retrieve_all') {

  //   // this.imageManagerService.retrieveAll(

  //   // );

  //   // this.textManagerService.retrieveAll(

  //   // );

  //   return this.assetManagerService.findAll();
  // }
}
