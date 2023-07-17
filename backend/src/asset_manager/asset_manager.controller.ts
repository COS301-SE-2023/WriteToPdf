import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
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
    return this.assetManagerService.rename_asset(
      renameAssetDTO,
    );
  }

  @Post('delete_asset')
  @HttpCode(HttpStatus.OK)
  delete_asset(
    @Body()
    deleteAssetDTO: AssetDTO,
  ) {
    return this.assetManagerService.delete_asset(
      deleteAssetDTO,
    );
  }
}
