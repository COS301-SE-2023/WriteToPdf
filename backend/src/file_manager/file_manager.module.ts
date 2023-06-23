import { Module } from '@nestjs/common';
import { FoldersService } from '../folders/folders.service';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { FileManagerService } from './file_manager.service';
import { MarkdownFile } from '../markdown_files/entities/markdown_file.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from '../folders/entities/folder.entity';
import { S3Service } from 'src/s3/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarkdownFile]),
    TypeOrmModule.forFeature([Folder]),
  ],
  controllers: [],
  providers: [
    FoldersService,
    MarkdownFilesService,
    FileManagerService,
    S3Service,
  ],
})
export class FileManagerModule {}
