import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        imports: [AuthModule],
        controllers: [AuthController],
        providers: [AuthService],
      }).compile();

    controller = module.get<AuthController>(
      AuthController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
