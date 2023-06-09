import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { LoginService } from './login.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';

describe('LoginService', () => {
  let service: LoginService;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          LoginService,
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

    service =
      module.get<LoginService>(LoginService);
    authService =
      module.get<AuthService>(AuthService);
    usersService =
      module.get<UsersService>(UsersService);
  });

  describe('login', () => {
    let authGuard: any;
    beforeEach(() => {
      authGuard = {
        canActivate: jest
          .fn()
          .mockReturnValue(true), // Mocking the auth guard behavior to always return true
      };
    });

    it('should throw exception if user is not found', async () => {
      const username = 'test';
      const pass = 'pass';
      jest
        .spyOn(usersService, 'findOne')
        .mockResolvedValue(undefined);

      try {
        await service.login(username, pass);
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getStatus()).toBe(
          HttpStatus.UNAUTHORIZED,
        );
        expect(e.getResponse()).toEqual({
          status: HttpStatus.UNAUTHORIZED,
          error: 'User not found',
        });
      }
    });

    it('should throw exception if password is incorrect', async () => {
      const username = 'test';
      const pass = 'pass';
      jest
        .spyOn(usersService, 'findOne')
        .mockResolvedValue({
          username,
          password: 'wrongpass',
        });

      try {
        await service.login(username, pass);
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getStatus()).toBe(
          HttpStatus.UNAUTHORIZED,
        );
        expect(e.getResponse()).toEqual({
          status: HttpStatus.UNAUTHORIZED,
          error: 'Invalid password',
        });
      }
    });

    it('should return token if credentials are correct', async () => {
      const username = 'test';
      const pass = 'pass';
      const token = 'token';
      jest
        .spyOn(usersService, 'findOne')
        .mockResolvedValue({
          username,
          password: pass,
        });
      jest
        .spyOn(authService, 'generateToken')
        .mockReturnValue(Promise.resolve(token));

      const result = await service.login(
        username,
        pass,
      );

      expect(result).toBe(token);
    });
  });
});
