import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiTestModule } from './api-test/api-test.module';

@Module({
  imports: [ApiTestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
