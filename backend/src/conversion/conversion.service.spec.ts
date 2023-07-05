import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { ConversionService } from './conversion.service';
import { ImportDTO } from '../file_manager/dto/import.dto';
import { ExportDTO } from '../file_manager/dto/export.dto';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  convertTextToDelta,
  convertDeltaToHtml,
} from 'node-quill-converter';

jest.mock('node-quill-converter', () => ({
  convertTextToDelta: jest.fn(),
  convertDeltaToHtml: jest.fn(),
}));

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
  describe('convertFrom', () => {
    it('should accept txt', () => {
      const importDTO = new ImportDTO();
      importDTO.Type = 'txt';

      jest
        .spyOn(service, 'convertFromText')
        .mockReturnValue(new MarkdownFileDTO());

      const markdownFileDTO =
        service.convertFrom(importDTO);

      expect(markdownFileDTO).toBeDefined();
      expect(
        service.convertFromText,
      ).toHaveBeenCalledWith(importDTO);
    });

    it('should throw an error when unsupported type is passed', () => {
      const importDTO = new ImportDTO();
      importDTO.Type = 'unsupported';

      try {
        service.convertFrom(importDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse()).toEqual(
          'Conversion from unsupported is not supported',
        );
      }
    });
  });
  describe('convertTo', () => {
    it('should accept txt', () => {
      const exportDTO = new ExportDTO();
      exportDTO.Type = 'txt';

      jest
        .spyOn(service, 'convertToTxt')
        .mockReturnValue(new ExportDTO());

      const txt = service.convertTo(exportDTO);

      expect(txt).toBeDefined();
      expect(
        service.convertToTxt,
      ).toHaveBeenCalledWith(exportDTO);
    });

    it('should throw an error when unsupported type is passed', () => {
      const exportDTO = new ExportDTO();
      exportDTO.Type = 'unsupported';

      try {
        service.convertTo(exportDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse()).toEqual(
          'Conversion to unsupported is not supported',
        );
      }
    });
  });
  describe('convertFromText', () => {
    it('should convert importDTO to markdownFileDTO with correct properties', async () => {
      const textDTO: ImportDTO = {
        Content: 'Sample content\n',
        Name: 'Sample Name',
        Path: 'Sample Path',
        ParentFolderID: 'Sample Folder ID',
        UserID: 0,
        MarkdownID: 'Markdown ID',
        Type: 'Txt',
      };

      const delta = {
        ops: [
          {
            insert: 'Sample content\n',
          },
        ],
      };

      (
        convertTextToDelta as jest.Mock
      ).mockReturnValue(delta);

      const result =
        service.convertFromText(textDTO);

      expect(result).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(result.Content).toBe(
        JSON.stringify(delta),
      );
      expect(result.Name).toBe(textDTO.Name);
      expect(result.Path).toBe(textDTO.Path);
      expect(result.ParentFolderID).toBe(
        textDTO.ParentFolderID,
      );
      expect(result.UserID).toBe(textDTO.UserID);
    });

    it('should convert empty importDTO to markdownFileDTO with empty Content', async () => {
      const textDTO: ImportDTO = {
        Content: '',
        Name: 'Sample Name',
        Path: 'Sample Path',
        ParentFolderID: 'Sample Folder ID',
        UserID: 0,
        MarkdownID: 'Markdown ID',
        Type: 'txt',
      };

      const delta = {
        ops: [{ insert: '\n' }],
      };

      (
        convertTextToDelta as jest.Mock
      ).mockReturnValue(delta);

      const result =
        service.convertFromText(textDTO);

      expect(result).toBeInstanceOf(
        MarkdownFileDTO,
      );
      expect(result.Content).toBe(
        JSON.stringify(delta),
      );
      expect(result.Name).toBe(textDTO.Name);
      expect(result.Path).toBe(textDTO.Path);
      expect(result.ParentFolderID).toBe(
        textDTO.ParentFolderID,
      );
      expect(result.UserID).toBe(textDTO.UserID);
    });
  });
  describe('convertToTxt', () => {
    it('should convert markdownFileDTO to exportDTO with correct properties', async () => {
      const markdownFileDTO: ExportDTO = {
        Content: JSON.stringify({
          ops: [
            {
              insert: 'Sample content\n',
            },
          ],
        }),
        Name: 'Sample Name',
        UserID: 0,
        MarkdownID: 'Markdown ID',
        Type: 'txt',
      };

      const html = '<p>Sample content</p>';

      const text = 'Sample content\n';

      (
        convertDeltaToHtml as jest.Mock
      ).mockReturnValue(html);

      const result = service.convertToTxt(
        markdownFileDTO,
      );

      expect(result).toBeInstanceOf(ExportDTO);
      expect(result.Content).toBe(text);
      expect(result.Name).toBe(
        markdownFileDTO.Name,
      );
    });
  });
});
