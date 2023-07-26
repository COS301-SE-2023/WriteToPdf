import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  dataSourceOptions,
  testDBOptions,
} from '../db/data-source';
import { MarkdownFilesModule } from './markdown_files/markdown_files.module';
import { FoldersModule } from './folders/folders.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
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
import { User } from './users/entities/user.entity';
import { AssetManagerModule } from './asset_manager/asset_manager.module';
import { ConversionService } from './conversion/conversion.service';
import { TextractController } from './textract/textract.controller';
import { TextractModule } from './textract/textract.module';
import { TextractService } from './textract/textract.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    // TypeOrmModule.forRoot(testDBOptions),
    TypeOrmModule.forFeature([MarkdownFile]),
    TypeOrmModule.forFeature([Folder]),
    TypeOrmModule.forFeature([User]),
    MarkdownFilesModule,
    FoldersModule,
    S3Module,
    FileManagerModule,
    AssetManagerModule,
    TextractModule,
  ],
  controllers: [
    AuthController,
    S3Controller,
    FileManagerController,
    TextractController,
  ],
  providers: [
    FileManagerService,
    MarkdownFilesService,
    FoldersService,
    S3Service,
    ConversionService,
    TextractService,
  ],
})
export class AppModule {}
