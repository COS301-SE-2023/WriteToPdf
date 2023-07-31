import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  // UploadedFile,
  // ParseFilePipe,
  Get,
  // FileTypeValidator,
} from '@nestjs/common';
import { S3Service } from './s3.service';
// import { FileDTO } from './dto/file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';

@Controller('s3')
export class S3Controller {
  constructor(
    private readonly s3Service: S3Service,
  ) {}

  @Post('delete_file')
  @UseInterceptors(FileInterceptor('file'))
  async deleteFile(
    @Body() fileDTO: MarkdownFileDTO,
  ) {
    return await this.s3Service.deleteFile(
      fileDTO,
    );
  }

  @Post('create_file')
  @UseInterceptors(FileInterceptor('file'))
  async createFile(
    @Body() fileDTO: MarkdownFileDTO,
  ) {
    return await this.s3Service.createFile(
      fileDTO,
    );
  }

  @Post('save_file')
  @UseInterceptors(FileInterceptor('file'))
  async saveFile(
    @Body() fileDTO: MarkdownFileDTO,
  ) {
    return await this.s3Service.saveFile(fileDTO);
  }

  @Get('retrieve_file')
  @UseInterceptors(FileInterceptor('file'))
  async retrieveFile(
    @Body() fileDTO: MarkdownFileDTO,
  ) {
    return await this.s3Service.retrieveFile(
      fileDTO,
    );
  }
}
