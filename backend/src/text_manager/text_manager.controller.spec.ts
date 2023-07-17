import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { TextManagerController } from './text_manager.controller';
import { TextManagerService } from './text_manager.service';

describe('TextManagerController', () => {
  let controller: TextManagerController;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [TextManagerController],
        providers: [TextManagerService],
      }).compile();

    controller =
      module.get<TextManagerController>(
        TextManagerController,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
