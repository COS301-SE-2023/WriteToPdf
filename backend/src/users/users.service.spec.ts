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
import { JwtService } from '@nestjs/jwt';

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
          JwtService,
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

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers = [
        new UserDTO(),
        new UserDTO(),
      ];

      jest
        .spyOn(Repository.prototype, 'find')
        .mockResolvedValue(expectedUsers);

      const result = await service.findAll();

      expect(result).toEqual(expectedUsers);
      expect(
        Repository.prototype.find,
      ).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const userID = 1;
      const expectedUser = new UserDTO();

      jest
        .spyOn(Repository.prototype, 'findOneBy')
        .mockResolvedValue(expectedUser);

      const result = await service.findOne(
        userID,
      );
      expect(result).toEqual(expectedUser);
      expect(
        Repository.prototype.findOneBy,
      ).toHaveBeenCalledWith({ UserID: userID });
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user', async () => {
      const email = 'test';
      const user1 = new UserDTO();
      const user2 = new UserDTO();

      jest
        .spyOn(Repository.prototype, 'query')
        .mockResolvedValue([user1, user2]);

      const result = await service.findOneByEmail(
        email,
      );

      expect(result).toEqual(user1);
      expect(
        Repository.prototype.query,
      ).toHaveBeenCalledWith(
        'SELECT * FROM USERS WHERE Email = ?',
        [email],
      );
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

    it('should create a user and return a success message', async () => {
      const user = new UserDTO();
      user.FirstName = 'Test';
      user.LastName = 'Test';
      user.Email = 'test';
      user.Password = 'test';

      jest
        .spyOn(service, 'isValidFirstName')
        .mockReturnValue(true);

      jest
        .spyOn(service, 'isValidLastName')
        .mockReturnValue(true);

      jest
        .spyOn(service, 'isValidEmail')
        .mockReturnValue(true);

      jest
        .spyOn(service, 'findOneByEmail')
        .mockResolvedValue(undefined);

      jest
        .spyOn(service, 'create')
        .mockResolvedValue(user);

      const result = await service.signup(user);

      expect(result).toEqual({
        message: 'User created successfully',
      });
      expect(
        service.isValidFirstName,
      ).toBeCalled();
      expect(
        service.isValidLastName,
      ).toBeCalled();
      expect(service.isValidEmail).toBeCalled();
      expect(service.findOneByEmail).toBeCalled();
      expect(service.create).toBeCalledWith(user);
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
          error: 'Invalid credentials',
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
          error: 'Invalid credentials',
        });
      }
    });

    it('should return token if credentials are correct', async () => {
      const loginDto = new UserDTO();
      loginDto.UserID = 1;

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
        FirstName: returnedUser.FirstName,
        EncryptionKey: 'pepperedPassword',
        Token: 'token',
      };

      const authToken = 'token';

      jest
        .spyOn(service, 'findOneByEmail')
        .mockResolvedValue(returnedUser);

      jest
        .spyOn(service, 'getPepperedPassword')
        .mockReturnValue(returnedUser.Password);

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
      expect(service.findOneByEmail).toBeCalled();
      expect(
        service.getPepperedPassword,
      ).toBeCalledWith(loginDto.Password);
      expect(
        authService.generateToken,
      ).toBeCalledWith(returnedUser);
    });
  });

  describe('getPepperedPassword', () => {
    it('should throw an error if pepper is not set', () => {
      const originalPepper = process.env.PEPPER;
      try {
        process.env.PEPPER = '';
        expect(() =>
          service.getPepperedPassword('test'),
        ).toThrowError(
          'Pepper value is not defined in the environment variables.',
        );
      } finally {
        process.env.PEPPER = originalPepper;
      }
    });

    it('should return a hashed password', () => {
      const result =
        service.getPepperedPassword('test');

      expect(result).toBe('pepperedPassword');
      expect(
        CryptoJS.SHA256,
      ).toHaveBeenCalledWith(
        'test' + process.env.PEPPER,
        10,
      );
    });
  });

  describe('getSalt', () => {
    it('should throw an error if the user is not found', async () => {
      const userDTO = new UserDTO();
      userDTO.Email = 'test';

      jest
        .spyOn(service, 'findOneByEmail')
        .mockResolvedValue(undefined);

      try {
        await service.getSalt(userDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.getStatus()).toBe(
          HttpStatus.NOT_FOUND,
        );
        expect(error.getResponse()).toEqual({
          status: HttpStatus.NOT_FOUND,
          error: 'User not found',
        });
      }
    });

    it('should throw an error if the salt is not found', async () => {
      const userDTO = new UserDTO();
      userDTO.Email = 'test';

      const user = new User();
      user.Salt = '';

      jest
        .spyOn(service, 'findOneByEmail')
        .mockResolvedValue(user);

      try {
        await service.getSalt(userDTO);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.getStatus()).toBe(
          HttpStatus.NOT_FOUND,
        );
        expect(error.getResponse()).toEqual({
          status: HttpStatus.NOT_FOUND,
          error: 'Salt not found',
        });
      }
    });

    it('should return a userDTO with the salt', async () => {
      const userDTO = new UserDTO();
      userDTO.Email = 'test';

      const expectedResponse = new UserDTO();
      expectedResponse.Salt = 'salt';

      const user = new User();
      user.Salt = 'salt';

      jest
        .spyOn(service, 'findOneByEmail')
        .mockResolvedValue(user);

      const result = await service.getSalt(
        userDTO,
      );

      expect(result).toStrictEqual(
        expectedResponse,
      );
      expect(service.findOneByEmail).toBeCalled();
    });
  });

  // describe('update', () => {
  //   it('should throw an exception if user is not found', async () => {
  //     const user = new UserDTO();
  //     user.UserID = 1;
  //     user.FirstName = 'Test';
  //     user.LastName = 'Test';
  //     user.Email = 'test';
  //     user.Password = 'test';

  //     jest
  //       .spyOn(service, 'findOne')
  //       .mockResolvedValue(undefined);

  //     try {
  //       await service.update(user);
  //       expect(true).toBe(false);
  //     } catch (error) {
  //       expect(error).toBeInstanceOf(
  //         HttpException,
  //       );
  //       expect(error.getStatus()).toEqual(
  //         HttpStatus.NOT_FOUND,
  //       );
  //       expect(error.getResponse()).toEqual({
  //         status: HttpStatus.NOT_FOUND,
  //         error: 'User not found',
  //       });
  //     }
  //   });
  // });
});
