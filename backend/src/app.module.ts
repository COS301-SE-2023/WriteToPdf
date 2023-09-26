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
import { S3ServiceMock } from './s3/__mocks__/s3.service';
import { User } from './users/entities/user.entity';
import { AssetManagerModule } from './asset_manager/asset_manager.module';
import { ConversionService } from './conversion/conversion.service';
import { TextractService } from './textract/textract.service';
import { ResetPasswordModule } from './reset_password/reset_password.module';
import { ResetPasswordRequest } from './reset_password/entities/reset_password_request.entity';
import { MailService } from './mail/mail.service';
import { DiffsService } from './diffs/diffs.service';
import { SnapshotService } from './snapshots/snapshots.service';
import { Diff } from './diffs/entities/diffs.entity';
import { Snapshot } from './snapshots/entities/snapshots.entity';
import { VersionControlModule } from './version_control/version_control.module';
import { VersionControlService } from './version_control/version_control.service';
import { VersionControlController } from './version_control/version_control.controller';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    // TypeOrmModule.forRoot(testDBOptions),
    TypeOrmModule.forFeature([MarkdownFile]),
    TypeOrmModule.forFeature([Folder]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([
      ResetPasswordRequest,
    ]),
    TypeOrmModule.forFeature([Diff]),
    TypeOrmModule.forFeature([Snapshot]),
    MarkdownFilesModule,
    FoldersModule,
    S3Module,
    FileManagerModule,
    AssetManagerModule,
    VersionControlModule,
    ResetPasswordModule,
  ],
  controllers: [
    AuthController,
    S3Controller,
    FileManagerController,
    VersionControlController,
  ],
  providers: [
    FileManagerService,
    MarkdownFilesService,
    FoldersService,
    S3Service,
    S3ServiceMock,
    ConversionService,
    TextractService,
    MailService,
    DiffsService,
    SnapshotService,
    VersionControlService,
  ],
})
export class AppModule {}
