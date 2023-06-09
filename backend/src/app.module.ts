import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiTestModule } from './api-test/api-test.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { UsersModule } from './users/users.module';
import { MarkdownFilesModule } from './markdown_files/markdown_files.module';
import { AssetsModule } from './assets/assets.module';
import { FoldersModule } from './folders/folders.module';

import 'dotenv/config';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    ApiTestModule,
    UsersModule,
    MarkdownFilesModule,
    AssetsModule,
    FoldersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
