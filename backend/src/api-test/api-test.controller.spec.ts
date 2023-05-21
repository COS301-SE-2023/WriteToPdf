import { Test, TestingModule } from '@nestjs/testing';
import { ApiTestController } from './api-test.controller';
import { ApiTestService } from './api-test.service';
import { ITest } from './interfaces/test.interface';

describe('ApiTestController', () => {
  let apiTestController: ApiTestController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ApiTestController],
      providers: [ApiTestService],
    }).compile();

    apiTestController = app.get<ApiTestController>(ApiTestController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(apiTestController.getLoremIpsum()).toMatchObject<ITest>({ data: 'Lorem Ipsum' });
    });
  });
});