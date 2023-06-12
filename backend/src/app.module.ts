import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiTestModule } from './api-test/api-test.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { MarkdownFilesModule } from './markdown_files/markdown_files.module';
import { AssetsModule } from './assets/assets.module';
import { FoldersModule } from './folders/folders.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { SignupController } from './signup/signup.controller';
import { SignupModule } from './signup/signup.module';
import { HomeController } from './home/home.controller';
import { HomeModule } from './home/home.module';
import { EditController } from './edit/edit.controller';
import { EditModule } from './edit/edit.module';
import { DatabaseController } from './database/database.controller';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import 'dotenv/config';

@Module({
  imports: [
    ApiTestModule,
    AuthModule,
    SignupModule,
    HomeModule,
    EditModule,
    DatabaseModule,
    UsersModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    MarkdownFilesModule,
    AssetsModule,
    FoldersModule,
  ],
  controllers: [
    AppController,
    AuthController,
    SignupController,
    HomeController,
    EditController,
    DatabaseController,
  ],
  providers: [AppService],
})
export class AppModule {}
