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
import { LoginController } from './login.controller';
import { JwtService } from '@nestjs/jwt';

describe('LoginController', () => {
  let controller: LoginController;
  let loginService: LoginService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [LoginController],
        providers: [
          LoginService,
          AuthService,
          UsersService,
          // Mock out unused services
          {
            provide: LoginService,
            useValue: {
              login: jest.fn(),
            },
          },
          {
            provide: JwtService,
            useValue: {
              sign: jest.fn(),
            },
          },
        ],
      }).compile();

    controller = module.get<LoginController>(
      LoginController,
    );
    loginService =
      module.get<LoginService>(LoginService);
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

    it('should be decorated with @Public', () => {
      const isPublic = Reflect.getMetadata(
        'isPublic',
        controller.login,
      );
      expect(isPublic).toBe(true);
    });

    it('should call login service', async () => {
      const username = 'test';
      const password = 'pass';
      const token = 'token';
      const request = { method: 'POST' };

      jest
        .spyOn(loginService, 'login')
        .mockResolvedValue(token);

      const result = await controller.login(
        {
          username,
          password,
        },
        request as any,
      );

      expect(
        loginService.login,
      ).toHaveBeenCalledWith(username, password);
      expect(result).toBe(token);
    });

    it('should throw exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const loginDto = {
        username: 'test',
        password: 'pass',
      };

      try {
        const result = await controller.login(
          loginDto,
          request as any,
        );
        console.log('Result: ', result);
        expect(true).toBe(false);
      } catch (error) {
        console.log('Error: ', error);
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Method Not Allowed',
        );
        expect(error.status).toBe(
          HttpStatus.METHOD_NOT_ALLOWED,
        );
      }
    });

    it('should return HTTP 200 OK for a valid login request', () => {
      const logInDto = {
        username: 'testuser',
        password: 'testpassword',
      };
      const expectedResult = {
        accessToken: 'dummyToken',
      };

      jest
        .spyOn(loginService, 'login')
        .mockReturnValue(
          Promise.resolve(expectedResult),
        );

      const request = {
        method: 'POST',
      } as Request;

      const result = controller.login(
        logInDto,
        request,
      );

      expect(result).toStrictEqual(
        Promise.resolve(expectedResult),
      );
      expect(
        loginService.login,
      ).toHaveBeenCalledWith(
        logInDto.username,
        logInDto.password,
      );
    });
  });
});
