import { Controller, Get } from '@nestjs/common';
import { ApiTestService as TestService } from './api-test.service';
import { ITest } from './interfaces/test.interface';

@Controller('test')
export class ApiTestController {
  constructor(private testService: TestService) {}

  @Get()
  getLoremIpsum(): ITest {
    return this.testService.getLoremIpsum();
  }
}
