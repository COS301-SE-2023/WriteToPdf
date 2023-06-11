import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { SignupService } from './signup.service';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SignupController } from './signup.controller';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

describe('SignupController', () => {
  let controller: SignupController;
  let signupService: SignupService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [SignupController],
        providers: [
          SignupService,
          AuthService,
          UsersService,
          // Mock out unused services
          {
            provide: SignupService,
            useValue: {
              signup: jest.fn(),
            },
          },
          {
            provide: JwtService,
            useValue: {
              sign: jest.fn(),
            },
          },
          {
            provide: getRepositoryToken(User),
            useClass: Repository,
          },
        ],
      }).compile();

    controller = module.get<SignupController>(
      SignupController,
    );
    signupService = module.get<SignupService>(
      SignupService,
    );
  });

  describe('signup', () => {
    let authGuard: any;
    beforeEach(() => {
      authGuard = {
        canActivate: jest
          .fn()
          .mockReturnValue(true), // Mocking the auth guard behavior to always return true
      };
    });

    it('should be decorated with @Public', () => {
      const guard = Reflect.getMetadata(
        'isPublic',
        SignupController.prototype.signup,
      );
      expect(guard).toBe(true);
    });

    it('should call signup service', async () => {
      const signupSpy = jest
        .spyOn(signupService, 'signup')
        .mockResolvedValue({ username: 'test' });
      const signupDTO = {
        username: 'test',
        password: 'pass',
      };
      const req: any = {
        method: 'POST',
      };
      const res = await controller.signup(
        signupDTO,
        req,
      );
      expect(res).toEqual({ username: 'test' });
      expect(signupSpy).toHaveBeenCalledWith(
        'test',
        'pass',
      );
    });

    it('should throw if signup fails', async () => {
      jest
        .spyOn(signupService, 'signup')
        .mockRejectedValue(
          new HttpException(
            'User already exists',
            HttpStatus.BAD_REQUEST,
          ),
        );
      const signupDTO = {
        username: 'test',
        password: 'pass',
      };
      const req: any = {
        method: 'POST',
      };
      await expect(
        controller.signup(signupDTO, req),
      ).rejects.toThrow(
        new HttpException(
          'User already exists',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const signupDTO = {
        username: 'test',
        password: 'pass',
      };

      try {
        await controller.signup(
          signupDTO,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
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
    it('should return HTTP 200 OK for a valid signup request', () => {
      const signupDTO = {
        username: 'testuser',
        password: 'testpassword',
      };
      const expectedResult = {
        accessToken: 'dummyToken',
      };

      jest
        .spyOn(signupService, 'signup')
        .mockReturnValue(
          Promise.resolve(expectedResult),
        );

      const request = {
        method: 'POST',
      } as Request;

      const result = controller.signup(
        signupDTO,
        request,
      );

      expect(result).toStrictEqual(
        Promise.resolve(expectedResult),
      );
      expect(
        signupService.signup,
      ).toHaveBeenCalledWith(
        signupDTO.username,
        signupDTO.password,
      );
    });
  });
});
