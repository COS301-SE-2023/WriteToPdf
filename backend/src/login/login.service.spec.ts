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
import { User } from '../users/entities/user.entity';

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
              findOneByEmail: jest.fn(),
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
    it('should throw exception if user is not found', async () => {
      const username = 'test';
      const pass = 'pass';
      jest
        .spyOn(usersService, 'findOneByEmail')
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
      const returnedUser = {
        username,
        password: 'wrongpass',
      } as unknown as User;
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(returnedUser);

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
      const returnedUser = {
        username,
        password: pass,
      } as unknown as User;
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(returnedUser);
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
