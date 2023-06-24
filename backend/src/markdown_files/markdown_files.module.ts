import { Module } from '@nestjs/common';
import { MarkdownFilesService } from './markdown_files.service';
import { MarkdownFilesController } from './markdown_files.controller';
import { MarkdownFile } from './entities/markdown_file.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarkdownFile]),
  ],
  controllers: [MarkdownFilesController],
  providers: [MarkdownFilesService],
})
export class MarkdownFilesModule {}
