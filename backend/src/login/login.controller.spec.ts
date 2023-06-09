import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

describe('LoginController', () => {
  let controller: LoginController;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        imports: [AuthModule, UsersModule],
        controllers: [LoginController],
        providers: [LoginService],
      }).compile();

    controller = module.get<LoginController>(
      LoginController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
