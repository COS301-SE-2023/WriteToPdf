import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { TextractController } from './textract.controller';
import { TextractService } from './textract.service';

describe('TextractController', () => {
  let controller: TextractController;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [TextractController],
        providers: [TextractService],
      }).compile();

    controller = module.get<TextractController>(
      TextractController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
