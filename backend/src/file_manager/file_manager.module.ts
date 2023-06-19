import { Module } from '@nestjs/common';
import { FoldersService } from '../folders/folders.service';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { FileManagerService } from './file_manager.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    FoldersService,
    MarkdownFilesService,
    FileManagerService,
  ],
})
export class FileManagerModule {}
