import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDTO } from './dto/refresh_token.dto';
import { UserDTO } from '../users/dto/user.dto';

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
      const userDTO = new UserDTO();
      userDTO.UserID = 1;
      const expectedPayload = {
        UserID: userDTO.UserID,
        ExpiresAt: expect.any(Date),
      };

      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue('mockToken');

      const actualToken =
        await service.generateToken(userDTO);

      expect(actualToken).toStrictEqual(
        'mockToken',
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
      refreshTokenDTO.Token = 'testtoken';

      const expectedPayload =
        new RefreshTokenDTO();
      expectedPayload.UserID =
        refreshTokenDTO.UserID;
      expectedPayload.Token = 'newtoken';

      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue('newtoken');

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ UserID: 1 });

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

    it('should throw an error if the token does not match the userID', async () => {
      const refreshTokenDTO =
        new RefreshTokenDTO();
      refreshTokenDTO.UserID = 1;
      refreshTokenDTO.Token = 'invalidtoken';

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue({ UserID: 2 });

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

    it('should throw an error if the token is invalid', async () => {
      const refreshTokenDTO =
        new RefreshTokenDTO();
      refreshTokenDTO.UserID = 1;
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
