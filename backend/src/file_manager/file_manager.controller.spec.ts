import { Test, TestingModule } from '@nestjs/testing';
import { FileManagerController } from './file_manager.controller';

describe('FileManagerController', () => {
  let controller: FileManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileManagerController],
    }).compile();

    controller = module.get<FileManagerController>(FileManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
