import {
  Test,
  TestingModule,
} from '@nestjs/testing';
// import { UsersService } from '../users/users.service';
// import { AuthService } from '../auth/auth.service';
import { LoginService } from './login.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

describe('LoginService', () => {
  let service: LoginService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        imports: [AuthModule, UsersModule],
        providers: [
          LoginService,
          // UsersService,
          // AuthService,
        ],
      }).compile();

    service =
      module.get<LoginService>(LoginService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
