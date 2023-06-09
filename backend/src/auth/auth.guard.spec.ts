import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { AuthModule } from './auth.module';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        imports: [AuthModule],
        providers: [AuthGuard],
      }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
