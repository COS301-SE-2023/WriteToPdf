import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { FileManagerService } from './file_manager.service';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

@Controller('file_manager')
export class FileManagerController {
  constructor(
    private readonly file_manager_service: FileManagerService,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  create(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      MarkdownFileDTO,
      markdownFileDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.file_manager_service.createFile(
      markdownFileDTO,
    );
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  delete(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      MarkdownFileDTO,
      markdownFileDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.file_manager_service.deleteFile(
      markdownFileDTO,
    );
  }

  @Post('rename')
  @HttpCode(HttpStatus.OK)
  rename(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      MarkdownFileDTO,
      markdownFileDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.file_manager_service.renameFile(
      markdownFileDTO,
    );
  }

  @Post('move')
  @HttpCode(HttpStatus.OK)
  move(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      MarkdownFileDTO,
      markdownFileDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.file_manager_service.moveFile(
      markdownFileDTO,
    );
  }

  @Post('save')
  @HttpCode(HttpStatus.OK)
  save(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      MarkdownFileDTO,
      markdownFileDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.file_manager_service.saveFile(
      markdownFileDTO,
    );
  }
}
