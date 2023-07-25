import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { TextractController } from './textract.controller';
import { TextractService } from './textract.service';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';

describe('TextractController', () => {
  let controller: TextractController;
  let textractService: TextractService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [TextractController],
        providers: [TextractService],
      }).compile();

    controller = module.get<TextractController>(
      TextractController,
    );
    textractService = module.get<TextractService>(
      TextractService,
    );
  });

  describe('extract_image', () => {
    it('should call textractService.extractDocument() and return the result', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      markdownFileDTO.MarkdownID = 'test id';
      markdownFileDTO.UserID = 1;

      const extractType = 'test';

      jest
        .spyOn(textractService, 'extractDocument')
        .mockResolvedValue('test result');

      const response =
        await controller.extractImage(
          markdownFileDTO,
          extractType,
        );

      expect(response).toEqual('test result');
      expect(
        textractService.extractDocument,
      ).toHaveBeenCalledWith(
        'sync',
        markdownFileDTO,
        extractType,
      );
    });
  });

  describe('extract_test', () => {
    it('should call textractService.test_get() and return the result', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      const extractType = 'test';

      const returnValue = 'test result' as any;

      jest
        .spyOn(textractService, 'test_get')
        .mockResolvedValue(returnValue);

      const response =
        await controller.extract_test(
          markdownFileDTO,
          extractType,
        );

      expect(response).toEqual('test result');
      expect(
        textractService.test_get,
      ).toHaveBeenCalledWith(extractType);
    });
  });

  describe('extract_msg', () => {
    it('should call textractService.test_msg() and return the result', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      const extractType = 'test';

      const returnValue = 'test result' as any;

      jest
        .spyOn(textractService, 'test_msg')
        .mockResolvedValue(returnValue);

      const response =
        await controller.extract_msg(
          markdownFileDTO,
          extractType,
        );

      expect(response).toEqual('test result');
      expect(
        textractService.test_msg,
      ).toHaveBeenCalledWith();
    });
  });

  describe('extract_del', () => {
    it('should call textractService.test_del() and return the result', async () => {
      const markdownFileDTO =
        new MarkdownFileDTO();
      const extractType = 'test';

      const returnValue = 'test result' as any;

      jest
        .spyOn(textractService, 'test_del')
        .mockResolvedValue(returnValue);

      const response =
        await controller.extract_del(
          markdownFileDTO,
          extractType,
        );

      expect(response).toEqual('test result');
      expect(
        textractService.test_del,
      ).toHaveBeenCalledWith();
    });
  });
});
