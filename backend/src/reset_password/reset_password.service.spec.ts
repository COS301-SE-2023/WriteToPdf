import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { ResetPasswordService } from './reset_password.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { ResetPasswordRequest } from './entities/reset_password_request.entity';
import { JwtService } from '@nestjs/jwt';

describe('ResetPasswordService', () => {
  let service: ResetPasswordService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          ResetPasswordService,
          JwtService,
          {
            provide: getRepositoryToken(
              ResetPasswordRequest,
            ),
            useClass: Repository,
          },
        ],
      }).compile();

    service = module.get<ResetPasswordService>(
      ResetPasswordService,
    );
  });

  describe('findOneByToken', () => {
    it('should find a request by the token', async () => {
      const token = 'token';

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValueOnce(
          new ResetPasswordRequest(),
        );

      const result = await service.findOneByToken(
        token,
      );

      expect(result).toBeInstanceOf(
        ResetPasswordRequest,
      );
      expect(
        Repository.prototype.findOne,
      ).toBeCalledWith({
        where: {
          Token: token,
        },
      });
    });
  });

  describe('findOneByTokenAndUserID', () => {
    it('should find a request by the token and userID', async () => {
      const token = 'token';
      const userID = 1;
      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValueOnce(
          new ResetPasswordRequest(),
        );

      const result =
        await service.findOneByTokenAndUserID(
          token,
          userID,
        );

      expect(result).toBeInstanceOf(
        ResetPasswordRequest,
      );
      expect(
        Repository.prototype.findOne,
      ).toBeCalledWith({
        where: {
          Token: token,
          UserID: userID,
        },
      });
    });
  });

  describe('findOneByUserID', () => {
    it('should delete all expired requests and retrieve one', async () => {
      const userID = 1;
      jest
        .spyOn(Repository.prototype, 'delete')
        .mockResolvedValueOnce(undefined);
      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValueOnce(
          new ResetPasswordRequest(),
        );

      const result =
        await service.findOneByUserID(userID);

      expect(result).toBeInstanceOf(
        ResetPasswordRequest,
      );
      expect(
        Repository.prototype.delete,
      ).toBeCalledWith({
        UserID: userID,
        DateExpires: LessThan(new Date()),
      });
    });
  });

  describe('remove', () => {
    it('should remove a request', async () => {
      const resetRequest =
        new ResetPasswordRequest();
      jest
        .spyOn(Repository.prototype, 'remove')
        .mockResolvedValueOnce(undefined);

      await service.remove(resetRequest);

      expect(
        Repository.prototype.remove,
      ).toBeCalledWith(resetRequest);
    });
  });

  describe('create', () => {
    it('should create a new request', async () => {
      const userID = 1;
      const email = 'email';
      const resetRequest =
        new ResetPasswordRequest();
      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValueOnce(resetRequest);

      jest
        .spyOn(service, 'generateToken')
        .mockResolvedValueOnce('token');

      const result = await service.create(
        userID,
        email,
      );

      expect(result).toBeInstanceOf(
        ResetPasswordRequest,
      );
      expect(
        Repository.prototype.save,
      ).toBeCalledWith(resetRequest);
      expect(
        service.generateToken,
      ).toBeCalledWith(
        userID,
        email,
        resetRequest.DateExpires,
      );
    });
  });

  describe('generateToken', () => {
    it('should generate a token', async () => {
      const userID = 1;
      const email = 'email';
      const dateExpires = new Date();

      jest
        .spyOn(JwtService.prototype, 'signAsync')
        .mockResolvedValueOnce('token');

      const result = await service.generateToken(
        userID,
        email,
        dateExpires,
      );

      expect(result).toEqual('token');
      expect(
        JwtService.prototype.signAsync,
      ).toBeCalled();
    });
  });
});
