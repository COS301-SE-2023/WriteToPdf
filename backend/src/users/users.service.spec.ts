import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AuthService } from '../auth/auth.service';
import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserDTO } from './dto/user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          UsersService,
          AuthService,
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

    service =
      module.get<UsersService>(UsersService);
    authService =
      module.get<AuthService>(AuthService);
  });

  describe('root/config', () => {
    it('user service should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('signup', () => {
    it('should throw an exception if first name is invalid', async () => {
      // const userFirstNameHasNumber = {
      //   FirstName: 'Test1',
      //   LastName: 'Test',
      //   Email: 'test@test.com',
      //   Password: 'test',
      // };
      const userFirstNameHasNumber =
        new UserDTO();

      userFirstNameHasNumber.FirstName = 'Test1';
      userFirstNameHasNumber.LastName = 'Test';
      userFirstNameHasNumber.Email =
        'test@test.com';
      userFirstNameHasNumber.Password = 'test';

      try {
        await service.signup(
          userFirstNameHasNumber,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.getStatus()).toEqual(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse()).toEqual({
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid first name',
        });
      }

      // const userFirstNameHasSpecialCharacter = {
      //   FirstName: 'Test@',
      //   LastName: 'Test',
      //   Email: 'test@test.com',
      //   Password: 'test',
      // };

      const userFirstNameHasSpecialCharacter =
        new UserDTO();

      userFirstNameHasSpecialCharacter.FirstName =
        'Test@';
      userFirstNameHasSpecialCharacter.LastName =
        'Test';
      userFirstNameHasSpecialCharacter.Email =
        'test@test.com';
      userFirstNameHasSpecialCharacter.Password =
        'test';

      try {
        await service.signup(
          userFirstNameHasSpecialCharacter,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.status).toEqual(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse()).toEqual({
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid first name',
        });
      }

      // const userFirstNameEmpty = {
      //   FirstName: '',
      //   LastName: 'Test',
      //   Email: 'test@test.com',
      //   Password: 'test',
      // };

      const userFirstNameEmpty = new UserDTO();
      userFirstNameEmpty.FirstName = '';
      userFirstNameEmpty.LastName = 'Test';
      userFirstNameEmpty.Email = 'test@test.com';
      userFirstNameEmpty.Password = 'test';

      try {
        await service.signup(userFirstNameEmpty);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.status).toEqual(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse()).toEqual({
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid first name',
        });
      }
    });

    it('should throw an exception if last name is invalid', async () => {
      // const userLastNameHasNumber = {
      //   FirstName: 'Test',
      //   LastName: 'Test1',
      //   Email: 'test@test.com',
      //   Password: 'test',
      // };

      const userLastNameHasNumber = new UserDTO();
      userLastNameHasNumber.FirstName = 'Test';
      userLastNameHasNumber.LastName = 'Test1';
      userLastNameHasNumber.Email =
        'test@test.com';
      userLastNameHasNumber.Password = 'test';

      try {
        await service.signup(
          userLastNameHasNumber,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.getStatus()).toEqual(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse()).toEqual({
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid last name',
        });
      }

      // const userLastNameHasSpecialCharacter = {
      //   FirstName: 'Test',
      //   LastName: 'Test@',
      //   Email: 'test@test.com',
      //   Password: 'test',
      // };

      const userLastNameHasSpecialCharacter =
        new UserDTO();

      userLastNameHasSpecialCharacter.FirstName =
        'Test';
      userLastNameHasSpecialCharacter.LastName =
        'Test@';
      userLastNameHasSpecialCharacter.Email =
        'test@test.com';
      userLastNameHasSpecialCharacter.Password =
        'test';

      try {
        await service.signup(
          userLastNameHasSpecialCharacter,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.status).toEqual(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse()).toEqual({
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid last name',
        });
      }

      // const userLastNameEmpty = {
      //   FirstName: 'Test',
      //   LastName: '',
      //   Email: 'test@test.com',
      //   Password: 'test',
      // };

      const userLastNameEmpty = new UserDTO();
      userLastNameEmpty.FirstName = 'Test';
      userLastNameEmpty.LastName = '';
      userLastNameEmpty.Email = 'test@test.com';
      userLastNameEmpty.Password = 'test';

      try {
        await service.signup(userLastNameEmpty);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.status).toEqual(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse()).toEqual({
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid last name',
        });
      }
    });

    it('should throw an exception if email is invalid', async () => {
      // const userMissingAtEmail = {
      //   FirstName: 'Test',
      //   LastName: 'Test',
      //   Email: 'testtest.com',
      //   Password: 'test',
      // };

      const userMissingAtEmail = new UserDTO();
      userMissingAtEmail.FirstName = 'Test';
      userMissingAtEmail.LastName = 'Test';
      userMissingAtEmail.Email = 'testtest.com';
      userMissingAtEmail.Password = 'test';

      try {
        await service.signup(userMissingAtEmail);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.getStatus()).toEqual(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse()).toEqual({
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid email',
        });
      }

      // const userEmptyEmail = {
      //   FirstName: 'Test',
      //   LastName: 'Test',
      //   Email: '',
      //   Password: 'test',
      // };

      const userEmptyEmail = new UserDTO();
      userEmptyEmail.FirstName = 'Test';
      userEmptyEmail.LastName = 'Test';
      userEmptyEmail.Email = '';
      userEmptyEmail.Password = 'test';

      try {
        await service.signup(userEmptyEmail);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.getStatus()).toEqual(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse()).toEqual({
          status: HttpStatus.BAD_REQUEST,
          error: 'Invalid email',
        });
      }
    });

    it('should throw an exception if email exists', async () => {
      // const user = {
      //   FirstName: 'Test',
      //   LastName: 'Test',
      //   Email: 'test@test.com',
      //   Password: 'test',
      // };

      const user = new UserDTO();
      user.FirstName = 'Test';
      user.LastName = 'Test';
      user.Email = 'test@test.com';
      user.Password = 'test';

      jest
        .spyOn(service, 'findOneByEmail')
        .mockImplementation(() =>
          Promise.resolve(user),
        );

      try {
        await service.signup(user);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.getStatus()).toEqual(
          HttpStatus.BAD_REQUEST,
        );
        expect(error.getResponse()).toEqual({
          status: HttpStatus.BAD_REQUEST,
          error: 'Email already exists',
        });
      }
    });
  });

  describe('login', () => {
    it('should throw exception if user is not found', async () => {
      // const loginDto = {
      //   Email: 'test',
      //   Password: 'pass',
      // };

      const loginDto = new UserDTO();
      loginDto.Email = 'test';
      loginDto.Password = 'pass';

      jest
        .spyOn(service, 'findOneByEmail')
        .mockResolvedValue(undefined);

      try {
        await service.login(loginDto);
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
      // const loginDto = {
      //   Email: 'test',
      //   Password: 'pass',
      // };

      const loginDto = new UserDTO();
      loginDto.Email = 'test';
      loginDto.Password = 'pass';

      const returnedUser = {
        Email: loginDto.Email,
        Password: 'wrongpass',
      } as unknown as User;

      jest
        .spyOn(service, 'findOneByEmail')
        .mockResolvedValue(returnedUser);

      try {
        await service.login(loginDto);
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getStatus()).toBe(
          HttpStatus.UNAUTHORIZED,
        );
        expect(e.getResponse()).toEqual({
          status: HttpStatus.UNAUTHORIZED,
          error: 'Incorrect password',
        });
      }
    });

    it('should return token if credentials are correct', async () => {
      // const loginDto = {
      //   Email: 'test',
      //   Password: 'pass',
      // };

      const loginDto = new UserDTO();
      loginDto.Email = 'test';
      loginDto.Password = 'pass';

      // const returnedUser = {
      //   UserID: 1,
      //   FirstName: 'Test',
      //   LastName: 'Test',
      //   Email: loginDto.Email,
      //   Password: loginDto.Password,
      // } as unknown as User;

      const returnedUser = new User();
      returnedUser.UserID = 1;
      returnedUser.FirstName = 'Test';
      returnedUser.LastName = 'Test';
      returnedUser.Email = loginDto.Email;
      returnedUser.Password = loginDto.Password;

      const expectedResponse = {
        UserID: returnedUser.UserID,
        Email: returnedUser.Email,
        Token: 'token',
      };

      const authToken = {
        access_token: 'token',
      };

      jest
        .spyOn(service, 'findOneByEmail')
        .mockResolvedValue(returnedUser);
      jest
        .spyOn(authService, 'generateToken')
        .mockReturnValue(
          Promise.resolve(authToken),
        );

      const result = await service.login(
        loginDto,
      );

      expect(result).toStrictEqual(
        expectedResponse,
      );
    });
  });
});
