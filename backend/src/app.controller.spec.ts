import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppModule } from './app.module';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule =
      await Test.createTestingModule({
        controllers: [AppController],
        providers: [AppService],
      }).compile();

    appController = app.get<AppController>(
      AppController,
    );
  });

  describe('root/config', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe(
        'Hello World!',
      );
    });

    it('new app module should be correctly instantiated', async () => {
      const appModule = new AppModule();
      expect(appModule).toBeDefined();
    });
  });
});
