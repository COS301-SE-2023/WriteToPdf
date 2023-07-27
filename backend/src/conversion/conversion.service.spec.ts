import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { ConversionService } from './conversion.service';
import puppeteer from 'puppeteer'; //PDF converter
import * as cheerio from 'cheerio'; //Plain text converter
import * as TurndownService from 'turndown'; //Markdown converter
import * as sharp from 'sharp';

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
          .mockResolvedValue('fake_pdf_data'),
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

  describe('generateTxt', () => {
    it('should generate plain text', () => {
      const html =
        '<html><body><h1>Hello, World!</h1></body></html>';

      jest.spyOn(cheerio, 'load');

      const txt = service.convertHtmlToTxt(html);

      expect(cheerio.load).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe('generateMarkdown', () => {
    it('should convert HTML to Markdown', () => {
      const html = '<p>Hello, World!</p>';
      const conversionService =
        new ConversionService();
      const markdown =
        conversionService.convertHtmlToMarkdown(
          html,
        );
      expect(markdown).toEqual('Hello, World!');
    });
  });

  describe('generateJpeg', () => {
    it('should convert HTML to Jpeg format', async () => {
      const mockBuffer: Buffer = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 4, // 4 channels for RGBA
          background: {
            r: 255,
            g: 255,
            b: 255,
            alpha: 1,
          }, // White background
        },
      })
        .png()
        .toBuffer();
      const mockPage = {
        setViewport: jest.fn(),
        setContent: jest.fn(),
        close: jest.fn(),
        screenshot: jest
          .fn()
          .mockReturnValue(mockBuffer),
      };

      const mockBrowser = {
        newPage: jest.fn(() => mockPage),
        close: jest.fn(),
      };

      jest
        .spyOn(puppeteer, 'launch')
        .mockResolvedValue(mockBrowser as any);

      const html = '<p>Hello, World!</p>';

      const response =
        await service.convertHtmlToJpeg(html);

      const expectedJpegImage = await sharp(
        mockBuffer,
      )
        .toFormat('jpeg')
        .toBuffer();
      expect(response).toEqual(expectedJpegImage);
    });

    it('generatePng', async () => {
      const mockBuffer: Buffer = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 4, // 4 channels for RGBA
          background: {
            r: 255,
            g: 255,
            b: 255,
            alpha: 1,
          }, // White background
        },
      })
        .png()
        .toBuffer();

      const mockBrowser = {
        newPage: jest.fn(() => mockPage),
        close: jest.fn(),
      };

      jest
        .spyOn(puppeteer, 'launch')
        .mockResolvedValue(mockBrowser as any);

      const mockPage = {
        setContent: jest.fn(),
        close: jest.fn(),
        screenshot: jest
          .fn()
          .mockReturnValue(mockBuffer),
      };

      const html = '<p>Hello, World!</p>';

      const response =
        await service.convertHtmlToPng(html);

      expect(response).toEqual(mockBuffer);
    });
  });
});
