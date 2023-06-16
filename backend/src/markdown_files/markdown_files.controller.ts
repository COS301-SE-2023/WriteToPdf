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
    // insert guards
    return this.markdownFilesService.create(
      createMarkdownFileDTO,
    );
  }

  @Get()
  findAll() {
    return this.markdownFilesService.findAll();
  }

  @Get(':MarkdownID')
  findOne(
    @Param('MarkdownID') MarkdownID: string,
  ) {
    return this.markdownFilesService.findOne(
      MarkdownID,
    );
  }

  @Patch(':MarkdownID')
  update(
    @Param('MarkdownID') MarkdownID: string,
    @Body()
    updateMarkdownFileDTO: UpdateMarkdownFileDTO,
  ) {
    // insert guards
    return this.markdownFilesService.update(
      MarkdownID,
      updateMarkdownFileDTO,
    );
  }

  @Delete(':MarkdownID')
  remove(
    @Param('MarkdownID') MarkdownID: string,
  ) {
    // insert guards
    return this.markdownFilesService.remove(
      MarkdownID,
    );
  }
}
