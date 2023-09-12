import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { VersionControlService } from './version_control.service';


describe('ConversionService', () => {
  let service: VersionControlService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [VersionControlService],
      }).compile();

    service = module.get<VersionControlService>(
      VersionControlService,
    );
  });

});