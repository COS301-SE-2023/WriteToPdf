import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  // FileTypeValidator,
} from '@nestjs/common';
import { S3Service } from './s3.service';
import { FileDTO } from './dto/file.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('s3')
export class S3Controller {
  constructor(
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Body() fileDTO: FileDTO,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new FileTypeValidator({
          //   fileType: 'image/jpeg',
          // }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.s3Service.upload(
      fileDTO,
      file.buffer,
    );
  }
}
