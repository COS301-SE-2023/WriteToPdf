import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { ConversionService } from './conversion.service';

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
  });

  describe('generatePdf', () => {
    it('should generate a PDF', async () => {
      const html = '<html><body><h1>Hello, World!</h1></body></html>';
      const pdf = await service.generatePdf(html);
      expect(pdf).toBeDefined();
    });
  });
});
