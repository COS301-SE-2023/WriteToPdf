import { Module } from '@nestjs/common';
import { ApiTestService } from './api-test.service';
import { ApiTestController } from './api-test.controller';

@Module({
  providers: [ApiTestService],
  controllers: [ApiTestController],
})
export class ApiTestModule {}
