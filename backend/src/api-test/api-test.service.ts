import { Injectable } from '@nestjs/common';
import { ITest } from './interfaces/test.interface';

@Injectable()
export class ApiTestService {
  getLoremIpsum(): ITest {
    return { data: 'Lorem Ipsum' };
  }
}
