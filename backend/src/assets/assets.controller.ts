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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAssetDTO: UpdateAssetDTO,
  ) {
    return this.assetsService.update(
      +id,
      updateAssetDTO,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetsService.remove(+id);
  }
}
