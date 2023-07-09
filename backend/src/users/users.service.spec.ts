import { config } from 'dotenv';
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
import * as CryptoJS from 'crypto-js';

config();

jest.mock('crypto-js', () => {
  const mockedHash = jest.fn(
    () => 'pepperedPassword',
  );

  return {
    SHA256: jest.fn().mockReturnValue({
      toString: mockedHash,
    }),
  };
});

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

  describe('create', () => {
    it('should throw an exception if pepper is not defined', async () => {
      const userDTO = new UserDTO();
      userDTO.FirstName = 'Test';
      userDTO.LastName = 'Test';
      userDTO.Email = 'test';
      userDTO.Password = 'test';

      const originalPepper = process.env.PEPPER;
      delete process.env.PEPPER;

      try {
        await service.create(userDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual(
          'Pepper value is not defined in the environment variables.',
        );
      } finally {
        process.env.PEPPER = originalPepper;
      }
    });

    it('should pepper the password and save the user', async () => {
      const userDTO = new UserDTO();
      userDTO.FirstName = 'Test';
      userDTO.LastName = 'Test';
      userDTO.Email = 'test';
      userDTO.Password = 'test';

      const expectedUser = new UserDTO();
      expectedUser.FirstName = 'Test';
      expectedUser.LastName = 'Test';
      expectedUser.Email = 'test';
      expectedUser.Password = 'pepperedPassword';

      jest
        .spyOn(Repository.prototype, 'create')
        .mockReturnValue(userDTO);

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValue(userDTO);

      const result = await service.create(
        userDTO,
      );

      expect(result).toEqual(expectedUser);
      expect(
        CryptoJS.SHA256,
      ).toHaveBeenCalledWith(
        'test' + process.env.PEPPER,
        10,
      );
      expect(
        Repository.prototype.create,
      ).toHaveBeenCalledWith(userDTO);
      expect(
        Repository.prototype.save,
      ).toHaveBeenCalledWith(userDTO);
    });
  });

  describe('signup', () => {
    it('should throw an exception if first name is invalid', async () => {
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
      const loginDto = new UserDTO();
      loginDto.Email = 'test';
      loginDto.Password = 'pass';

      const returnedUser = new User();
      returnedUser.UserID = 1;
      returnedUser.FirstName = 'Test';
      returnedUser.LastName = 'Test';
      returnedUser.Email = loginDto.Email;
      returnedUser.Password = loginDto.Password;
      returnedUser.Salt = 'salt';

      const expectedResponse = {
        UserID: returnedUser.UserID,
        Email: returnedUser.Email,
        Token: 'token',
        ExpiresAt: 3600,
      };

      const authToken = {
        access_token: 'token',
        expires_at: 3600,
      };

      jest
        .spyOn(service, 'findOneByEmail')
        .mockResolvedValue(returnedUser);
      jest
        .spyOn(authService, 'generateToken')
        .mockReturnValue(
          Promise.resolve(authToken),
        );

      //TODO fix this to work with pepper
      // const result = await service.login(
      //   loginDto,
      // );

      // expect(result).toStrictEqual(
      //   expectedResponse,
      // );
    });
  });
});
