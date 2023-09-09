import {
  Controller,
  Post,
  Body,
  Headers,
  HttpStatus,
  HttpCode,
  HttpException,
} from '@nestjs/common';
import { AssetManagerService } from './asset_manager.service';
import { AssetDTO } from '../assets/dto/asset.dto';
import { RetrieveAllDTO } from './dto/retrieve_all.dto';

@Controller('asset_manager')
export class AssetManagerController {
  constructor(
    private readonly assetManagerService: AssetManagerService,
  ) {}

  @Post('upload_asset')
  upload_asset(
    @Body()
    uploadImageDTO: AssetDTO,
    @Headers('isTest') isTest: string, // For using mocked out services
  ) {
    if (!uploadImageDTO.UserID) {
      throw new HttpException(
        'Invalid request data: UserID missing',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      uploadImageDTO.ParentFolderID == undefined
    ) {
      throw new HttpException(
        'Invalid request data: ParentFolderID missing',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.assetManagerService.upload_asset(
      uploadImageDTO,
      isTest && isTest === 'true' ? true : false,
    );
  }

  @Post('retrieve_all')
  @HttpCode(HttpStatus.OK)
  retrieve_all(
    @Body()
    retrieveAllDTO: RetrieveAllDTO,
    @Headers('isTest') isTest: string, // For using mocked out services
  ) {
    if (!retrieveAllDTO.UserID) {
      throw new HttpException(
        'Invalid request data: UserID missing',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      retrieveAllDTO.ParentFolderID == undefined
    ) {
      throw new HttpException(
        'Invalid request data: ParentFolderID missing',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.assetManagerService.retrieve_all(
      retrieveAllDTO,
      isTest && isTest === 'true' ? true : false,
    );
  }

  // Copy to clipboard
  @Post('retrieve_one')
  @HttpCode(HttpStatus.OK)
  retrieve_one(
    @Body()
    retrieveOneDTO: AssetDTO,
    @Headers('isTest') isTest: string, // For using mocked out services
  ) {
    return this.assetManagerService.retrieve_one(
      retrieveOneDTO,
      isTest && isTest === 'true' ? true : false,
    );
  }

  @Post('rename_asset')
  @HttpCode(HttpStatus.OK)
  rename_asset(
    @Body()
    renameAssetDTO: AssetDTO,
  ) {
    return this.assetManagerService.rename_asset(
      renameAssetDTO,
    );
  }

  @Post('update_asset')
  @HttpCode(HttpStatus.OK)
  update_asset(
    @Body()
    updateAssetDTO: AssetDTO,
  ) {
    return this.assetManagerService.update_asset(
      updateAssetDTO,
    );
  }

  @Post('delete_asset')
  @HttpCode(HttpStatus.OK)
  delete_asset(
    @Body()
    deleteAssetDTO: AssetDTO,
    @Headers('isTest') isTest: string, // For using mocked out services
  ) {
    return this.assetManagerService.delete_asset(
      deleteAssetDTO,
      isTest && isTest === 'true' ? true : false,
    );
  }
}
