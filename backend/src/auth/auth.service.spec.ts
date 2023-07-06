import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDTO } from './dto/refresh_token.dto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          AuthService,
          {
            provide: JwtService,
            useValue: {
              signAsync: jest.fn(
                () => 'mockToken',
              ),
              verifyAsync: jest.fn(() => ({})),
            },
          },
        ],
      }).compile();

    service =
      module.get<AuthService>(AuthService);
    jwtService =
      module.get<JwtService>(JwtService);
  });

  describe('generateToken', () => {
    it('should return an access token', async () => {
      const username = 'testuser';
      const password = 'testpassword';
      const expectedPayload = {
        username,
        password,
      };
      const expectedToken = {
        access_token: 'mockToken',
        expires_at: expect.any(Date),
      };

      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue('mockToken');

      const actualToken =
        await service.generateToken(
          username,
          password,
        );

      expect(actualToken).toStrictEqual(
        expectedToken,
      );
      expect(
        jwtService.signAsync,
      ).toHaveBeenCalledWith(expectedPayload);
    });
  });

  describe('refreshToken', () => {
    it('should return a new refresh token', async () => {
      const refreshTokenDTO =
        new RefreshTokenDTO();
      refreshTokenDTO.UserID = 1;
      refreshTokenDTO.Email = 'testuser';
      refreshTokenDTO.Token = 'testtoken';

      const expectedPayload =
        new RefreshTokenDTO();
      expectedPayload.UserID =
        refreshTokenDTO.UserID;
      expectedPayload.Email =
        refreshTokenDTO.Email;
      expectedPayload.Token = 'newtoken';
      expectedPayload.ExpiresAt =
        expect.any(Date);

      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue('newtoken');

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({});

      const actualToken =
        await service.refreshToken(
          refreshTokenDTO,
        );

      expect(actualToken).toStrictEqual(
        expectedPayload,
      );
      expect(
        jwtService.signAsync,
      ).toHaveBeenCalled();

      expect(
        jwtService.verifyAsync,
      ).toHaveBeenCalledWith(
        refreshTokenDTO.Token,
      );
    });

    it('should throw an error if the token is invalid', async () => {
      const refreshTokenDTO =
        new RefreshTokenDTO();
      refreshTokenDTO.UserID = 1;
      refreshTokenDTO.Email = 'testuser';
      refreshTokenDTO.Token = 'invalidtoken';

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error());

      await expect(
        service.refreshToken(refreshTokenDTO),
      ).rejects.toThrow();

      expect(
        jwtService.verifyAsync,
      ).toHaveBeenCalledWith(
        refreshTokenDTO.Token,
      );

      expect(
        jwtService.signAsync,
      ).not.toHaveBeenCalled();
    });
  });
});
