import { Module } from '@nestjs/common';
import { FoldersService } from '../folders/folders.service';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { FileManagerService } from './file_manager.service';
import { MarkdownFile } from '../markdown_files/entities/markdown_file.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from '../folders/entities/folder.entity';
import { S3Service } from '../s3/s3.service';
import { ConversionService } from '../conversion/conversion.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { FileManagerController } from './file_manager.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarkdownFile]),
    TypeOrmModule.forFeature([Folder]),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [FileManagerController],
  providers: [
    FoldersService,
    MarkdownFilesService,
    FileManagerService,
    S3Service,
    ConversionService,
    UsersService,
    AuthService,
  ],
})
export class FileManagerModule {}
