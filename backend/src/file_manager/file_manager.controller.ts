import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { FileManagerService } from './file_manager.service';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';

@Controller('file-manager')
export class FileManagerController {
  constructor(
    private readonly file_manager_service: FileManagerService,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  create(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
  ) {
    return this.file_manager_service.createFile(
      markdownFileDTO,
    );
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  delete(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
  ) {
    return this.file_manager_service.deleteFile(
      markdownFileDTO,
    );
  }

  @Post('rename')
  @HttpCode(HttpStatus.OK)
  rename(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
  ) {
    return this.file_manager_service.renameFile(
      markdownFileDTO,
    );
  }

  @Post('move')
  @HttpCode(HttpStatus.OK)
  move(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
  ) {
    return this.file_manager_service.moveFile(
      markdownFileDTO,
    );
  }
}
