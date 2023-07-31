import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppController', () => {
  it('new app module should be correctly instantiated', async () => {
    const appModule = new AppModule();
    expect(appModule).toBeDefined();
  });
});
