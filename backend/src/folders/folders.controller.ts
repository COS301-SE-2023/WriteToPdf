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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foldersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFolderDTO: UpdateFolderDTO,
  ) {
    return this.foldersService.update(
      +id,
      updateFolderDTO,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.foldersService.remove(+id);
  }
}
