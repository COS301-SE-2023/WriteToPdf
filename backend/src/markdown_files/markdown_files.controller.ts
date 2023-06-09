import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarkdownFilesService } from './markdown_files.service';
import { CreateMarkdownFileDto } from './dto/create-markdown_file.dto';
import { UpdateMarkdownFileDto } from './dto/update-markdown_file.dto';

@Controller('markdown-files')
export class MarkdownFilesController {
  constructor(private readonly markdownFilesService: MarkdownFilesService) {}

  @Post()
  create(@Body() createMarkdownFileDto: CreateMarkdownFileDto) {
    return this.markdownFilesService.create(createMarkdownFileDto);
  }

  @Get()
  findAll() {
    return this.markdownFilesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.markdownFilesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarkdownFileDto: UpdateMarkdownFileDto) {
    return this.markdownFilesService.update(+id, updateMarkdownFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.markdownFilesService.remove(+id);
  }
}
