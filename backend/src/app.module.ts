import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { MarkdownFilesModule } from './markdown_files/markdown_files.module';
import { AssetsModule } from './assets/assets.module';
import { FoldersModule } from './folders/folders.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { HomeController } from './home/home.controller';
import { HomeModule } from './home/home.module';
import { EditController } from './edit/edit.controller';
import { EditModule } from './edit/edit.module';
import { UsersModule } from './users/users.module';
import { FileManagerController } from './file_manager/file_manager.controller';
import { FileManagerService } from './file_manager/file_manager.service';
import { FileManagerModule } from './file_manager/file_manager.module';
import 'dotenv/config';
import { MarkdownFilesService } from './markdown_files/markdown_files.service';
import { FoldersService } from './folders/folders.service';

@Module({
  imports: [
    AuthModule,
    HomeModule,
    EditModule,
    UsersModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    MarkdownFilesModule,
    AssetsModule,
    FoldersModule,
    FileManagerModule,
  ],
  controllers: [
    AppController,
    AuthController,
    HomeController,
    EditController,
    FileManagerController,
  ],
  providers: [
    AppService,
    FileManagerService,
    MarkdownFilesService,
    FoldersService,
  ],
})
export class AppModule {}
