import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MarkdownFilesService } from './markdown_files.service';
import { CreateMarkdownFileDTO } from './dto/create-markdown_file.dto';
import { UpdateMarkdownFileDTO } from './dto/update-markdown_file.dto';

@Controller('markdown-files')
export class MarkdownFilesController {
  constructor(
    private readonly markdownFilesService: MarkdownFilesService,
  ) {}

  @Post()
  create(
    @Body()
    createMarkdownFileDTO: CreateMarkdownFileDTO,
  ) {
    return this.markdownFilesService.create(
      createMarkdownFileDTO,
    );
  }

  @Get()
  findAll() {
    return this.markdownFilesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.markdownFilesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body()
    updateMarkdownFileDTO: UpdateMarkdownFileDTO,
  ) {
    return this.markdownFilesService.update(
      id,
      updateMarkdownFileDTO,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.markdownFilesService.remove(id);
  }
}
