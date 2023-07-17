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
import { RetrieveAllDTO } from './dto/retrieve_all.dto';

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

  @Post('retrieve_all')
  retrieve_all(
    @Body()
    retrieveAllDTO: RetrieveAllDTO,
  ) {
    return this.assetManagerService.retrieve_all(
      retrieveAllDTO,
    );
  }

  @Post('rename_asset')
  rename_asset(
    @Body()
    renameAssetDTO: AssetDTO,
  ) {
    return this.assetManagerService.renameAsset(
      renameAssetDTO,
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
