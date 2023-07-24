import { Module } from '@nestjs/common';
import { MarkdownFilesService } from './markdown_files.service';
import { MarkdownFile } from './entities/markdown_file.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarkdownFile]),
  ],
  providers: [MarkdownFilesService],
})
export class MarkdownFilesModule {}
