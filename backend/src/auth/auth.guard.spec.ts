import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { AuthModule } from './auth.module';
import {
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { sign } from 'jsonwebtoken';
import { jwtConstants } from './constants';
import { IS_PUBLIC_KEY } from './auth.controller';

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

  it('should throw exception if token is missing', async () => {
    const context =
      createMock<ExecutionContext>();
    const request = createMock<Request>({
      method: 'POST',
    });
    context
      .switchToHttp()
      .getRequest.mockReturnValue(request);
    try {
      await guard.canActivate(context as any);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(
        UnauthorizedException,
      );
      expect(e.message).toBe('Missing token');
    }
  });

  it('should throw exception if token is invalid', async () => {
    const context =
      createMock<ExecutionContext>();
    const request = createMock<Request>({
      method: 'POST',
      headers: {
        authorization: 'Bearer test',
      } as any,
    });
    context
      .switchToHttp()
      .getRequest.mockReturnValue(request);
    try {
      await guard.canActivate(context as any);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(
        UnauthorizedException,
      );
      expect(e.message).toBe('Invalid token');
    }
  });

  const generateValidToken = () => {
    const payload = { userId: 1 };
    const token = sign(
      payload,
      jwtConstants.secret,
    );
    return token;
  };

  it('should return true if token is valid', async () => {
    const context =
      createMock<ExecutionContext>();
    const request = createMock<Request>({
      method: 'POST',
      headers: {
        authorization:
          'Bearer ' + generateValidToken(),
      } as any,
    });
    context
      .switchToHttp()
      .getRequest.mockReturnValue(request);
    const result = await guard.canActivate(
      context as any,
    );
    expect(result).toBe(true);
  });

  it('should return true for public endpoints', async () => {
    const context =
      createMock<ExecutionContext>();
    const request = createMock<Request>({
      method: 'POST',
    });
    context
      .switchToHttp()
      .getRequest.mockReturnValue(request);
    const handlerWithDecorator = () => {
      /* */
    };
    Reflect.defineMetadata(
      IS_PUBLIC_KEY,
      true,
      handlerWithDecorator,
    );
    context.getHandler.mockReturnValue(
      handlerWithDecorator,
    );
    const result = await guard.canActivate(
      context as any,
    );
    expect(result).toBe(true);
  });
});
