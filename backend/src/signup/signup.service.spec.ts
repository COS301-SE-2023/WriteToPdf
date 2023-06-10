import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { SignupService } from './signup.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

describe('SignupService', () => {
  let service: SignupService;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          SignupService,
          {
            provide: AuthService,
            useValue: {
              generateToken: jest.fn(),
            },
          },
          {
            provide: UsersService,
            useValue: {
              findOne: jest.fn(),
            },
          },
        ],
      }).compile();

    service = module.get<SignupService>(
      SignupService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  //TODO add more tests here (like the ones from login.service.spec.ts)
});
