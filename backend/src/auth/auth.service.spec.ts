import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

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
      };

      const actualToken =
        await service.generateToken(
          username,
          password,
        );

      expect(actualToken).toEqual(expectedToken);
      expect(
        jwtService.signAsync,
      ).toHaveBeenCalledWith(expectedPayload);
    });
  });
});
