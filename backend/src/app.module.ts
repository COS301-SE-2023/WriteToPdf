import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  dataSourceOptions,
  testDBOptions,
} from '../db/data-source';
import { MarkdownFilesModule } from './markdown_files/markdown_files.module';
import { AssetsModule } from './assets/assets.module';
import { FoldersModule } from './folders/folders.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { EditController } from './edit/edit.controller';
import { EditModule } from './edit/edit.module';
import { UsersModule } from './users/users.module';
import { S3Controller } from './s3/s3.controller';
import { S3Module } from './s3/s3.module';
import { FileManagerController } from './file_manager/file_manager.controller';
import { FileManagerService } from './file_manager/file_manager.service';
import { FileManagerModule } from './file_manager/file_manager.module';
import 'dotenv/config';
import { MarkdownFilesService } from './markdown_files/markdown_files.service';
import { FoldersService } from './folders/folders.service';
import { MarkdownFile } from './markdown_files/entities/markdown_file.entity';
import { Folder } from './folders/entities/folder.entity';
import { S3Service } from './s3/s3.service';
import { ConversionService } from './conversion/conversion.service';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    AuthModule,
    EditModule,
    UsersModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    // TypeOrmModule.forRoot(testDBOptions),
    TypeOrmModule.forFeature([MarkdownFile]),
    TypeOrmModule.forFeature([Folder]),
    TypeOrmModule.forFeature([User]),
    MarkdownFilesModule,
    AssetsModule,
    FoldersModule,
    S3Module,
    FileManagerModule,
  ],
  controllers: [
    AppController,
    AuthController,
    EditController,
    S3Controller,
    FileManagerController,
  ],
  providers: [
    AppService,
    FileManagerService,
    MarkdownFilesService,
    FoldersService,
    S3Service,
    ConversionService,
  ],
})
export class AppModule {}
