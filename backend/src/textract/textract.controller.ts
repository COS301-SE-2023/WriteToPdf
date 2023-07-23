import {
  Controller,
  Post,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { TextractService } from './textract.service';

@Controller('textract')
export class TextractController {
  constructor(
    private readonly textractService: TextractService,
  ) {}
  @Post('extract_image')
  @UseInterceptors(FileInterceptor('file'))
  async extractImage(
    @Body() fileDTO: MarkdownFileDTO,
    ExtractType: string,
  ) {
    const retVal =
      await this.textractService._extractDocumentSynchronous(
        fileDTO,
        ExtractType,
      );

    console.log(retVal);

    return retVal;
  }
}
