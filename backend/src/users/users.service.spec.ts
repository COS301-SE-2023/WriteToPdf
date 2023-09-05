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
import { JwtService } from '@nestjs/jwt';
import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserDTO } from './dto/user.dto';
import * as CryptoJS from 'crypto-js';
import { OAuth2Client } from 'google-auth-library';
import { hashSync, genSaltSync } from 'bcryptjs';
import { ResetPasswordService } from '../reset_password/reset_password.service';
import { ResetPasswordRequest } from '../reset_password/entities/reset_password_request.entity';
import { MailService } from '../mail/mail.service';
import { ResetPasswordRequestDTO } from '../reset_password/dto/reset_password_request.dto';

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

jest.mock('bcryptjs', () => {
  const mockedSalt = jest.fn(() => 'salt');

  const mockedHashSync = jest.fn(
    () => 'hashedPassword',
  );

  return {
    genSaltSync: mockedSalt,
    hashSync: mockedHashSync,
  };
});

describe('UsersService', () => {
  let service: UsersService;
  let authService: AuthService;
  let resetPasswordService: ResetPasswordService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          UsersService,
          AuthService,
          JwtService,
          ResetPasswordService,
          MailService,
          {
            provide: getRepositoryToken(User),
            useClass: Repository,
          },
          {
            provide: getRepositoryToken(
              ResetPasswordRequest,
            ),
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
    resetPasswordService =
      module.get<ResetPasswordService>(
        ResetPasswordService,
      );
    jwtService =
      module.get<JwtService>(JwtService);
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

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValue(user1);

      const result = await service.findOneByEmail(
        email,
      );

      expect(result).toEqual(user1);
      expect(
        Repository.prototype.findOne,
      ).toHaveBeenCalledWith({
        where: {
          Email: email,
        },
      });
    });
  });

  describe('findOneByToken', () => {
    it('should throw an error if the request is not found', async () => {
      const token = 'test';

      jest
        .spyOn(
          resetPasswordService,
          'findOneByToken',
        )
        .mockResolvedValue(undefined);

      try {
        await service.findOneByToken(token);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.status).toEqual(
          HttpStatus.NOT_FOUND,
        );
        expect(error.getResponse()).toEqual({
          status: HttpStatus.NOT_FOUND,
          error:
            'Reset password request not found',
        });
      }
    });

    it('should throw an error if the user does not exist', async () => {
      const token = 'test';
      const resetRequest =
        new ResetPasswordRequest();
      resetRequest.UserID = 1;

      jest
        .spyOn(
          resetPasswordService,
          'findOneByToken',
        )
        .mockResolvedValue(resetRequest);

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValue(undefined);

      try {
        await service.findOneByToken(token);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.status).toEqual(
          HttpStatus.NOT_FOUND,
        );
        expect(error.getResponse()).toEqual({
          status: HttpStatus.NOT_FOUND,
          error: 'User not found',
        });
      }
    });

    it('should return a user', async () => {
      const token = 'test';
      const resetRequest =
        new ResetPasswordRequest();
      resetRequest.UserID = 1;
      const user = new UserDTO();
      user.UserID = 1;

      jest
        .spyOn(
          resetPasswordService,
          'findOneByToken',
        )
        .mockResolvedValue(resetRequest);

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValue(user);

      const result = await service.findOneByToken(
        token,
      );

      expect(result).toEqual(user);

      expect(
        resetPasswordService.findOneByToken,
      ).toBeCalledWith(token);
      expect(
        Repository.prototype.findOne,
      ).toBeCalledWith({
        where: {
          UserID: resetRequest.UserID,
        },
      });
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
        .mockRejectedValueOnce(undefined);

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

  describe('googleSignIn', () => {
    it('should verify the token and throw an exception if it is not valid', async () => {
      const credential = 'test';

      jest
        .spyOn(service, 'verifyGoogleToken')
        .mockResolvedValue(undefined);

      try {
        await service.googleSignIn(credential);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.getStatus()).toBe(
          HttpStatus.UNAUTHORIZED,
        );
        expect(error.getResponse()).toEqual(
          'Invalid credential',
        );
        expect(
          service.verifyGoogleToken,
        ).toBeCalled();
      }
    });

    it('should create a user if it does not exist', async () => {
      const credential = 'test';

      const decodedToken = {
        email: 'test',
        given_name: 'test',
        family_name: 'test',
      };

      const expectedUser = new UserDTO();
      expectedUser.Email = 'test';
      expectedUser.FirstName = 'test';
      expectedUser.LastName = 'test';
      expectedUser.UserID = 1;

      jest
        .spyOn(service, 'verifyGoogleToken')
        .mockResolvedValue(decodedToken as any);

      jest
        .spyOn(service, 'findOneByEmail')
        .mockResolvedValue(undefined);

      (
        jest.spyOn(service, 'generateSalt') as any
      ).mockResolvedValue('salt');

      jest
        .spyOn(service, 'generateRandomPassword')
        .mockReturnValue('randomPassword');

      jest
        .spyOn(service, 'generateHashedPassword')
        .mockReturnValue('hashedPassword');

      jest
        .spyOn(service, 'create')
        .mockResolvedValue(expectedUser);

      jest
        .spyOn(authService, 'generateToken')
        .mockResolvedValue('token');

      const result = await service.googleSignIn(
        credential,
      );

      expect(result).toEqual({
        UserID: 1,
        Email: 'test',
        FirstName: 'test',
        Token: 'token',
        EncryptionKey: 'pepperedPassword',
      });
      expect(
        service.verifyGoogleToken,
      ).toBeCalled();
      expect(service.findOneByEmail).toBeCalled();
      expect(service.create).toBeCalled();
      expect(
        authService.generateToken,
      ).toBeCalled();
      expect(service.generateSalt).toBeCalled();
      expect(
        service.generateRandomPassword,
      ).toBeCalled();
      expect(
        service.generateHashedPassword,
      ).toBeCalled();
    });
  });

  describe('verifyGoogleToken', () => {
    it('should verify Google token successfully', async () => {
      const mockIdToken = 'token';
      const mockPayload = {
        // Mocked payload object
        sub: 'test',
        name: 'test',
        email: 'test',
      };

      const verifyIdTokenMock = jest
        .fn()
        .mockResolvedValue({
          getPayload: jest
            .fn()
            .mockReturnValue(mockPayload),
        });

      jest
        .spyOn(
          OAuth2Client.prototype,
          'verifyIdToken',
        )
        .mockImplementation(verifyIdTokenMock);

      const result =
        await service.verifyGoogleToken(
          mockIdToken,
        );

      expect(result).toEqual(mockPayload);
      expect(
        verifyIdTokenMock,
      ).toHaveBeenCalledWith({
        idToken: mockIdToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    });

    it('should throw an error on invalid token', async () => {
      const mockIdToken = 'invalidToken';

      const verifyIdTokenMock = jest
        .fn()
        .mockRejectedValue(
          new Error('Invalid token'),
        );

      jest
        .spyOn(
          OAuth2Client.prototype,
          'verifyIdToken',
        )
        .mockImplementation(verifyIdTokenMock);

      await expect(
        service.verifyGoogleToken(mockIdToken),
      ).rejects.toThrowError(
        new HttpException(
          'Invalid credential',
          HttpStatus.UNAUTHORIZED,
        ),
      );
    });
  });

  describe('generateSalt', () => {
    it('should generate a salt', async () => {
      const result = await service.generateSalt();

      expect(result).toEqual('salt');
    });
  });

  describe('generateRandomPassword', () => {
    it('should generate a random password', async () => {
      const result =
        await service.generateRandomPassword();

      expect(result).toEqual(expect.any(String));
      expect(result.length).toBe(8);
    });
  });

  describe('generateHashedPassword', () => {
    it('should generate a hashed password', async () => {
      const password = 'test';
      const salt = 'salt';

      const result =
        await service.generateHashedPassword(
          password,
          salt,
        );

      expect(result).toEqual('hashedPassword');
      expect(hashSync).toHaveBeenCalledWith(
        password,
        salt,
      );
    });
  });

  describe('resetPassword', () => {
    it('should throw an error if the request is not found', async () => {
      const resetPasswordDTO =
        new ResetPasswordRequestDTO();

      const user = new User();
      user.UserID = 1;
      user.Email = 'test';

      jest
        .spyOn(service, 'findOneByToken')
        .mockResolvedValue(user);

      jest
        .spyOn(
          resetPasswordService,
          'findOneByTokenAndUserID',
        )
        .mockResolvedValue(undefined);

      try {
        await service.resetPassword(
          resetPasswordDTO,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.status).toEqual(
          HttpStatus.NOT_FOUND,
        );
        expect(error.getResponse()).toEqual({
          status: HttpStatus.NOT_FOUND,
          error:
            'Reset password request not found',
        });
      }

      expect(service.findOneByToken).toBeCalled();
      expect(
        resetPasswordService.findOneByTokenAndUserID,
      ).toBeCalled();
    });

    it('should throw an error if the request is expired', async () => {
      const resetPasswordDTO =
        new ResetPasswordRequestDTO();

      const user = new User();
      user.UserID = 1;
      user.Email = 'test';

      const resetRequest =
        new ResetPasswordRequest();
      resetRequest.UserID = user.UserID;
      resetRequest.DateExpires = new Date(
        new Date().getTime() -
          1000 * 60 * 60 * 24,
      );

      jest
        .spyOn(service, 'findOneByToken')
        .mockResolvedValue(user);

      jest
        .spyOn(
          resetPasswordService,
          'findOneByTokenAndUserID',
        )
        .mockResolvedValue(resetRequest);

      try {
        await service.resetPassword(
          resetPasswordDTO,
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
          error: 'Reset password request expired',
        });
      }
    });

    it('should verify the userID and expiry date in the token', async () => {
      const resetPasswordDTO =
        new ResetPasswordRequestDTO();
      resetPasswordDTO.Token = 'token';

      const user = new User();
      user.UserID = 1;

      const resetRequest =
        new ResetPasswordRequest();
      resetRequest.UserID = user.UserID;
      resetRequest.DateExpires = new Date(
        new Date().getTime() +
          1000 * 60 * 60 * 24,
      );

      jest
        .spyOn(service, 'findOneByToken')
        .mockResolvedValue(user);

      jest
        .spyOn(
          resetPasswordService,
          'findOneByTokenAndUserID',
        )
        .mockResolvedValue(resetRequest);

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({
          UserID: 0,
          DateExpires: resetRequest.DateExpires,
        });

      try {
        await service.resetPassword(
          resetPasswordDTO,
        );
        expect(true).toBe(true);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.getResponse()).toEqual({
          status: HttpStatus.UNAUTHORIZED,
          error: 'Invalid token',
        });
        expect(error.status).toEqual(
          HttpStatus.UNAUTHORIZED,
        );
      }
    });

    it('should return a success message', async () => {
      const resetPasswordDTO =
        new ResetPasswordRequestDTO();
      resetPasswordDTO.Token = 'token';

      const user = new User();
      user.UserID = 1;

      const resetRequest =
        new ResetPasswordRequest();
      resetRequest.UserID = user.UserID;
      resetRequest.DateExpires = new Date(
        new Date().getTime() +
          1000 * 60 * 60 * 24,
      );

      jest
        .spyOn(service, 'findOneByToken')
        .mockResolvedValue(user);

      jest
        .spyOn(
          resetPasswordService,
          'findOneByTokenAndUserID',
        )
        .mockResolvedValue(resetRequest);

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({
          UserID: user.UserID,
          DateExpires: resetRequest.DateExpires,
        });

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValue(undefined);

      jest
        .spyOn(resetPasswordService, 'remove')
        .mockResolvedValue(undefined);

      const result = await service.resetPassword(
        resetPasswordDTO,
      );

      expect(result).toEqual({
        message: 'Password reset successfully',
      });

      expect(service.findOneByToken).toBeCalled();
      expect(
        resetPasswordService.findOneByTokenAndUserID,
      ).toBeCalled();
      expect(jwtService.verifyAsync).toBeCalled();
      expect(
        Repository.prototype.save,
      ).toBeCalled();
      expect(
        resetPasswordService.remove,
      ).toBeCalled();
    });
  });
});
