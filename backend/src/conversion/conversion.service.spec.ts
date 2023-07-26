import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { ConversionService } from './conversion.service';
import puppeteer from 'puppeteer'; //PDF converter

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
      const mockPage = {
        setViewport: jest.fn(),
        setContent: jest.fn(),
        pdf: jest
          .fn()
          .mockResolvedValue('fake_pdf_data'), // Mock the pdf function to return a fake PDF data
        close: jest.fn(),
      };

      const mockBrowser = {
        newPage: jest.fn(() => mockPage),
        close: jest.fn(),
      };

      jest
        .spyOn(puppeteer, 'launch')
        .mockResolvedValue(mockBrowser as any);

      const html =
        '<html><body><h1>Hello, World!</h1></body></html>';
      const pdf = await service.generatePdf(html);

      expect(
        puppeteer.launch,
      ).toHaveBeenCalledTimes(1);
    });
  });
});
