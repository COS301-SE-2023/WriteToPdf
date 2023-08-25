import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { ResetPasswordService } from './reset_password.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResetPasswordRequest } from './entities/reset_password_request.entity';

describe('ResetPasswordService', () => {
  let service: ResetPasswordService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          ResetPasswordService,
          {
            provide: getRepositoryToken(
              ResetPasswordRequest,
            ),
            useClass: Repository,
          },
        ],
      }).compile();

    service = module.get<ResetPasswordService>(
      ResetPasswordService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
