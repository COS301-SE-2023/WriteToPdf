import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDTO } from './dto/create-asset.dto';
import { UpdateAssetDTO } from './dto/update-asset.dto';

@Controller('assets')
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService,
  ) {}

  @Post()
  create(@Body() createAssetDTO: CreateAssetDTO) {
    return this.assetsService.create(
      createAssetDTO,
    );
  }

  @Get()
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':AssetID')
  findOne(@Param('AssetID') AssetID: string) {
    return this.assetsService.findOne(AssetID);
  }

  @Patch(':AssetID')
  update(
    @Param('AssetID') AssetID: string,
    @Body() updateAssetDTO: UpdateAssetDTO,
  ) {
    return this.assetsService.update(
      AssetID,
      updateAssetDTO,
    );
  }

  @Delete(':AssetID')
  remove(@Param('AssetID') AssetID: string) {
    return this.assetsService.remove(AssetID);
  }
}
