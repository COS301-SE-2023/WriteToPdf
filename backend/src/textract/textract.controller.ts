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
      await this.textractService._extractDocumentAsynchronous(
        fileDTO,
        ExtractType,
      );

    console.log(retVal);

    return retVal;
  }

  @Post('extract_test')
  @UseInterceptors(FileInterceptor('file'))
  async extract_test(
    @Body() fileDTO: MarkdownFileDTO,
    ExtractType: string,
  ) {
    const retVal =
      await this.textractService.test_get(
        ExtractType,
      );

    console.log(retVal);

    return retVal;
  }

  @Post('extract_msg')
  @UseInterceptors(FileInterceptor('file'))
  async extract_msg(
    @Body() fileDTO: MarkdownFileDTO,
    ExtractType: string,
  ) {
    const retVal =
      await this.textractService.test_msg();

    console.log(retVal);

    return retVal;
  }

  @Post('extract_del')
  @UseInterceptors(FileInterceptor('file'))
  async extract_del(
    @Body() fileDTO: MarkdownFileDTO,
    ExtractType: string,
  ) {
    const retVal =
      await this.textractService.test_del();

    console.log(retVal);

    return retVal;
  }
}
