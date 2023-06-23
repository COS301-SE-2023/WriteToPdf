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
}
