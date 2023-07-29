import {
  Controller,
  Post,
  Body,
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

    console.log(
      'Image data sent from frontend: ',
      uploadImageDTO.Image,
    );

    return this.assetManagerService.upload_asset(
      uploadImageDTO,
    );
  }

  @Post('retrieve_all')
  @HttpCode(HttpStatus.OK)
  retrieve_all(
    @Body()
    retrieveAllDTO: RetrieveAllDTO,
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
    );
  }

  // Copy to clipboard
  @Post('retrieve_one')
  @HttpCode(HttpStatus.OK)
  retrieve_one(
    @Body()
    retrieveOneDTO: AssetDTO,
  ) {
    return this.assetManagerService.retrieve_one(
      retrieveOneDTO,
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
