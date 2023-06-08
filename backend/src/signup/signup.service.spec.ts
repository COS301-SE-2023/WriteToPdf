import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { SignupService } from './signup.service';

describe('SignupService', () => {
  let service: SignupService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [SignupService],
      }).compile();

    service = module.get<SignupService>(
      SignupService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
