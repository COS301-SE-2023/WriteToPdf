import { Module } from '@nestjs/common';
import { TextractService } from './textract.service';

@Module({
  providers: [TextractService],
})
export class TextractModule {}
