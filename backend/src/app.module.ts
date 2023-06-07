import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiTestModule } from './api-test/api-test.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';

import 'dotenv/config';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ApiTestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
