import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDTO } from './dto/create-folder.dto';
import { UpdateFolderDTO } from './dto/update-folder.dto';

@Controller('folders')
export class FoldersController {
  constructor(
    private readonly foldersService: FoldersService,
  ) {}

  @Post()
  create(
    @Body() createFolderDTO: CreateFolderDTO,
  ) {
    return this.foldersService.create(
      createFolderDTO,
    );
  }

  @Get()
  findAll() {
    return this.foldersService.findAll();
  }

  @Get(':FolderID')
  findOne(@Param('FolderID') FolderID: string) {
    return this.foldersService.findOne(FolderID);
  }

  @Patch(':FolderID')
  update(
    @Param('FolderID') FolderID: string,
    @Body() updateFolderDTO: UpdateFolderDTO,
  ) {
    return this.foldersService.update(
      FolderID,
      updateFolderDTO,
    );
  }

  @Delete(':FolderID')
  remove(@Param('FolderID') FolderID: string) {
    return this.foldersService.remove(FolderID);
  }
}
