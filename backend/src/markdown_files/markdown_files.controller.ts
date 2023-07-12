import {
  Controller,
  Post,
  Body,
  Delete,
} from '@nestjs/common';
import { MarkdownFilesService } from './markdown_files.service';
import { MarkdownFileDTO } from './dto/markdown_file.dto';

@Controller('markdown-files')
export class MarkdownFilesController {
  constructor(
    private readonly markdownFilesService: MarkdownFilesService,
  ) {}

  // @Post()
  // create(
  //   @Body()
  //   createMarkdownFileDTO: MarkdownFileDTO,
  // ) {
  //   // insert guards
  //   return this.markdownFilesService.create(
  //     createMarkdownFileDTO,
  //   );
  // }

  // @Delete(':MarkdownID')
  // remove(
  //   @Body()
  //   removeMarkdownFileDTO: MarkdownFileDTO,
  // ) {
  //   // insert guards
  //   return this.markdownFilesService.remove(
  //     removeMarkdownFileDTO,
  //   );
  // }
}
