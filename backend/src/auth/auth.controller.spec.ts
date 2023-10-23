import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { RefreshTokenDTO } from './dto/refresh_token.dto';
import { SignatureDTO } from './dto/signature.dto';
import {
  HttpException,
  HttpStatus,
} from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        imports: [AuthModule],
        controllers: [AuthController],
        providers: [AuthService],
      }).compile();

    controller = module.get<AuthController>(
      AuthController,
    );
    authService =
      module.get<AuthService>(AuthService);
  });

  describe('refreshToken', () => {
    it('should throw exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const refreshTokenDTO =
        new RefreshTokenDTO();

      try {
        await controller.refreshToken(
          refreshTokenDTO,
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

    it('should throw an exception if UserID is undefined', async () => {
      const request = { method: 'POST' };
      const refreshTokenDTO =
        new RefreshTokenDTO();
      refreshTokenDTO.Token = 'test';

      try {
        await controller.refreshToken(
          refreshTokenDTO,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request body',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an exception if Token is undefined', async () => {
      const request = { method: 'POST' };
      const refreshTokenDTO =
        new RefreshTokenDTO();
      refreshTokenDTO.UserID = 1;

      try {
        await controller.refreshToken(
          refreshTokenDTO,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request body',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should return a new access token', async () => {
      const request = { method: 'POST' };
      const refreshTokenDTO =
        new RefreshTokenDTO();
      refreshTokenDTO.UserID = 1;
      refreshTokenDTO.Token = 'test';

      jest
        .spyOn(authService, 'refreshToken')
        .mockResolvedValue(new RefreshTokenDTO());

      const result =
        await controller.refreshToken(
          refreshTokenDTO,
          request as any,
        );

      expect(result).toBeInstanceOf(
        RefreshTokenDTO,
      );
      expect(
        authService.refreshToken,
      ).toBeCalledWith(refreshTokenDTO);
    });
  });

  describe('sign_checksum', () => {
    it('should throw exception if request method is not POST', async () => {
      const request = { method: 'GET' };
      const signatureDTO = new SignatureDTO();

      try {
        await controller.signChecksum(
          signatureDTO,
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

    it('should throw an exception if UserID is undefined', async () => {
      const signatureDTO = new SignatureDTO();
      signatureDTO.Checksum = 'test';
      signatureDTO.MarkdownID = 'test';

      const request = { method: 'POST' };

      try {
        await controller.signChecksum(
          signatureDTO,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request body',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an exception if Checksum is undefined', async () => {
      const signatureDTO = new SignatureDTO();
      signatureDTO.UserID = 1;
      signatureDTO.MarkdownID = 'test';

      const request = { method: 'POST' };

      try {
        await controller.signChecksum(
          signatureDTO,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request body',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should throw an exception if MarkdownID is undefined', async () => {
      const signatureDTO = new SignatureDTO();
      signatureDTO.UserID = 1;
      signatureDTO.Checksum = 'test';

      const request = { method: 'POST' };

      try {
        await controller.signChecksum(
          signatureDTO,
          request as any,
        );
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(
          HttpException,
        );
        expect(error.message).toBe(
          'Invalid request body',
        );
        expect(error.status).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    it('should return a signed checksum', async () => {
      const signatureDTO = new SignatureDTO();
      signatureDTO.UserID = 1;
      signatureDTO.Checksum = 'test';
      signatureDTO.MarkdownID = 'test';

      const request = { method: 'POST' };

      (
        jest.spyOn(
          authService,
          'signChecksum',
        ) as any
      ).mockResolvedValue(new SignatureDTO());

      const result =
        await controller.signChecksum(
          signatureDTO,
          request as any,
        );

      expect(result).toBeInstanceOf(SignatureDTO);
      expect(
        authService.signChecksum,
      ).toBeCalledWith(signatureDTO);
    });
  });
});
