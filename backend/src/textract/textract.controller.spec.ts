import { Test, TestingModule } from '@nestjs/testing';
import { TextractController } from './textract.controller';

describe('TextractController', () => {
  let controller: TextractController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TextractController],
    }).compile();

    controller = module.get<TextractController>(TextractController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
