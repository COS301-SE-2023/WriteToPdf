import { Module } from '@nestjs/common';
import { FoldersService } from '../folders/folders.service';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { FileManagerService } from './file_manager.service';
import { MarkdownFile } from '../markdown_files/entities/markdown_file.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from '../folders/entities/folder.entity';
import { S3Service } from '../s3/s3.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { FileManagerController } from './file_manager.controller';
import { ConversionService } from '../conversion/conversion.service';
import { S3ServiceMock } from '../s3/__mocks__/s3.service';
import { ResetPasswordService } from '../reset_password/reset_password.service';
import { ResetPasswordRequest } from '../reset_password/entities/reset_password_request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarkdownFile]),
    TypeOrmModule.forFeature([Folder]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([
      ResetPasswordRequest,
    ]),
  ],
  controllers: [FileManagerController],
  providers: [
    FoldersService,
    MarkdownFilesService,
    FileManagerService,
    S3Service,
    UsersService,
    AuthService,
    ConversionService,
    S3ServiceMock,
    ResetPasswordService,
  ],
})
export class FileManagerModule {}
