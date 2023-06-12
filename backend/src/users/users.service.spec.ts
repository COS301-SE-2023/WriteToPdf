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

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
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

    service =
      module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('signup', () => {
    it('should throw an exception if first name is invalid', async () => {
      const userFirstNameHasNumber = {
        FirstName: 'Test1',
        LastName: 'Test',
        Email: 'test@test.com',
        Password: 'test',
      };

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

      const userFirstNameHasSpecialCharacter = {
        FirstName: 'Test@',
        LastName: 'Test',
        Email: 'test@test.com',
        Password: 'test',
      };

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

      const userFirstNameEmpty = {
        FirstName: '',
        LastName: 'Test',
        Email: 'test@test.com',
        Password: 'test',
      };

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
      const userLastNameHasNumber = {
        FirstName: 'Test',
        LastName: 'Test1',
        Email: 'test@test.com',
        Password: 'test',
      };

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

      const userLastNameHasSpecialCharacter = {
        FirstName: 'Test',
        LastName: 'Test@',
        Email: 'test@test.com',
        Password: 'test',
      };

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

      const userLastNameEmpty = {
        FirstName: 'Test',
        LastName: '',
        Email: 'test@test.com',
        Password: 'test',
      };

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
      const userMissingAtEmail = {
        FirstName: 'Test',
        LastName: 'Test',
        Email: 'testtest.com',
        Password: 'test',
      };

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

      const userEmptyEmail = {
        FirstName: 'Test',
        LastName: 'Test',
        Email: '',
        Password: 'test',
      };

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
      const user = {
        FirstName: 'Test',
        LastName: 'Test',
        Email: 'test@test.com',
        Password: 'test',
      };

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
});
