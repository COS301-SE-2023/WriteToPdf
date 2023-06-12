import { Module } from '@nestjs/common';
import { MarkdownFilesService } from './markdown_files.service';
import { MarkdownFilesController } from './markdown_files.controller';

@Module({
  controllers: [MarkdownFilesController],
  providers: [MarkdownFilesService],
})
export class MarkdownFilesModule {}
