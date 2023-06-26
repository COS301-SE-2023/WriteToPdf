import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { ConversionService } from './conversion.service';
import { ConversionModule } from './conversion.module';

describe('ConversionService', () => {
  let service: ConversionService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [ConversionService],
      }).compile();

    service = module.get<ConversionService>(
      ConversionService,
    );
  });

  describe('root/config', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
    it('module should be defined when instantiated', () => {
      const conversionModule =
        new ConversionModule();
      expect(conversionModule).toBeInstanceOf(
        ConversionModule,
      );
    });
  });
});
