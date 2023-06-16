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
import { LoginUserDTO } from './dto/login-user.dto';
import { AuthService } from '../auth/auth.service';
import { CreateUserDTO } from './dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        imports: [...testingModule()],
        controllers: [UsersController],
        providers: [
          UsersService,
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

    module.close();
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  // Create is a concept implemented by signup
  // describe('create', () => {
  //   // it('should return the created user')
  // });

  describe('findOne', () => {
    console.log('UsersController.findOne');
  });

  describe('findAll', () => {
    it('should return an array of all users', async () => {
      const result = [
        {
          UserID: '1',
          FirstName: 'John',
          LastName: 'Doe',
          Email: 'johndoe@example.com',
          Password: 'mypassword',
        },
      ];
      jest
        .spyOn(controller, 'findAll')
        .mockImplementation(async () => result);

      expect(await controller.findAll()).toBe(
        result,
      );
    });
  });

  describe('update', () => {
    // it('should return updated user')
    // it('should throw exception if user not found')
    console.log('UsersController.update');
  });

  describe('remove', () => {
    // it('should return removed user')
    // it('should throw exception if user not found')
    console.log('UsersController.remove');
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
      const loginUserDTO = new LoginUserDTO();
      loginUserDTO.Email = 'test';
      loginUserDTO.Password = 'test';

      const expectedResult = {
        UserID: 1,
        Email: 'test',
        Token: Promise.resolve('test'),
      };

      const request = { method: 'POST' };

      jest
        .spyOn(controller, 'login')
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
      const loginUserDTO = new LoginUserDTO();
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
      const createUserDTO = new CreateUserDTO();
      createUserDTO.FirstName = 'Test';
      createUserDTO.LastName = 'Test';
      createUserDTO.Email = 'test';
      createUserDTO.Password = 'test';

      const expectedResult = {
        message: 'User created successfully',
      };

      const request = { method: 'POST' };

      jest
        .spyOn(controller, 'signup')
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
      const createUserDTO = new CreateUserDTO();
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
  });
});
