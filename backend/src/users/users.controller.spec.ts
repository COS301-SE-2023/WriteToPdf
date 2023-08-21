import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { testingModule } from '../test-utils/testingModule';
import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UserDTO } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        imports: [...testingModule()],
        controllers: [UsersController],
        providers: [
          UsersService,
          JwtService,
          MailService,
          {
            provide: getRepositoryToken(User),
            useClass: Repository,
          },
          {
            provide: AuthService,
            useValue: {
              generateToken: jest.fn(),
            },
          },
        ],
      }).compile();

    // controller is defined by module configured to use testDB
    controller = module.get<UsersController>(
      UsersController,
    );

    usersService =
      module.get<UsersService>(UsersService);

    module.close();
  });

  describe('login', () => {
    it('should be decorated with @Public', () => {
      const isPublic = Reflect.getMetadata(
        'isPublic',
        controller.login,
      );
      expect(isPublic).toBe(true);
    });

    it('should return a user on successful login', async () => {
      const loginUserDTO = new UserDTO();
      loginUserDTO.Email = 'test';
      loginUserDTO.Password = 'test';

      const expectedResult = {
        UserID: 1,
        Email: 'test',
        Token: Promise.resolve('test'),
      };

      const request = { method: 'POST' };

      jest
        .spyOn(usersService, 'login')
        .mockImplementation(
          async () => expectedResult,
        );

      expect(
        await controller.login(
          loginUserDTO,
          request as any,
        ),
      ).toBe(expectedResult);
    });

    it('should throw exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const loginUserDTO = new UserDTO();
      loginUserDTO.Email = 'test';
      loginUserDTO.Password = 'test';

      try {
        await controller.login(
          loginUserDTO,
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

    it('should throw exception if password is missing', async () => {
      const request = { method: 'POST' };
      const loginUserDTO = {
        Password: 'test',
      };

      try {
        await controller.login(
          loginUserDTO as any,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw exception if email is missing', async () => {
      const request = { method: 'POST' };
      const loginUserDTO = {
        Email: 'test',
      };

      try {
        await controller.login(
          loginUserDTO as any,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });
  });

  describe('signup', () => {
    it('should be decorated with @Public', () => {
      const isPublic = Reflect.getMetadata(
        'isPublic',
        controller.signup,
      );
      expect(isPublic).toBe(true);
    });

    it('should return the newly registered user', async () => {
      const createUserDTO = new UserDTO();
      createUserDTO.FirstName = 'Test';
      createUserDTO.LastName = 'Test';
      createUserDTO.Email = 'test';
      createUserDTO.Password = 'test';

      const expectedResult = {
        message: 'User created successfully',
      };

      const request = { method: 'POST' };

      jest
        .spyOn(usersService, 'signup')
        .mockImplementation(
          async () => expectedResult,
        );

      expect(
        await controller.signup(
          createUserDTO,
          request as any,
        ),
      ).toBe(expectedResult);
    });

    it('should throw exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const createUserDTO = new UserDTO();
      createUserDTO.FirstName = 'Test';
      createUserDTO.LastName = 'Test';
      createUserDTO.Email = 'test';
      createUserDTO.Password = 'test';

      try {
        await controller.signup(
          createUserDTO,
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

    it('should throw exception if password is missing', async () => {
      const request = { method: 'POST' };
      const createUserDTO = {
        Password: 'test',
      };

      try {
        await controller.signup(
          createUserDTO as any,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw exception if email is missing', async () => {
      const request = { method: 'POST' };
      const createUserDTO = {
        Email: 'test',
      };

      try {
        await controller.signup(
          createUserDTO as any,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw exception if first name is missing', async () => {
      const request = { method: 'POST' };
      const createUserDTO = {
        FirstName: 'test',
      };

      try {
        await controller.signup(
          createUserDTO as any,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw exception if last name is missing', async () => {
      const request = { method: 'POST' };
      const createUserDTO = {
        LastName: 'test',
      };

      try {
        await controller.signup(
          createUserDTO as any,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });
  });

  describe('get_salt', () => {
    it('should be decorated with @Public', () => {
      const isPublic = Reflect.getMetadata(
        'isPublic',
        controller.getSalt,
      );
      expect(isPublic).toBe(true);
    });

    it('should throw an error if method is not POST', async () => {
      const request = { method: 'GET' };
      const userDTO = new UserDTO();
      userDTO.Email = 'test';

      try {
        await controller.getSalt(
          userDTO,
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

    it('should throw an error if email is missing', async () => {
      const request = { method: 'POST' };
      const userDTO = {};

      try {
        await controller.getSalt(
          userDTO as any,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should return the salt', async () => {
      const request = { method: 'POST' };
      const userDTO = new UserDTO();
      userDTO.Email = 'test';

      const expectedResult = new UserDTO();

      jest
        .spyOn(usersService, 'getSalt')
        .mockImplementation(
          async () => expectedResult,
        );

      expect(
        await controller.getSalt(
          userDTO,
          request as any,
        ),
      ).toBe(expectedResult);
    });
  });

  describe('google_signin', () => {
    it('should be decorated with @Public', () => {
      const isPublic = Reflect.getMetadata(
        'isPublic',
        controller.googleSignIn,
      );
      expect(isPublic).toBe(true);
    });

    it('should throw exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const payload: any = {
        credential: 'test',
      };

      try {
        await controller.googleSignIn(
          payload,
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

    it('should throw exception if password is missing', async () => {
      const request = { method: 'POST' };
      const payload: any = {
        NOTcredential: 'test',
      };

      try {
        await controller.signup(
          payload,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request data',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should return the newly registered user', async () => {
      const request = { method: 'POST' };
      const payload: any = {
        credential: 'test',
      };

      const expectedResult = {
        message: 'User created successfully',
      };

      jest
        .spyOn(usersService, 'googleSignIn')
        .mockImplementation(
          async () => expectedResult as any,
        );

      expect(
        await controller.googleSignIn(
          payload,
          request as any,
        ),
      ).toBe(expectedResult);
    });
  });
});
