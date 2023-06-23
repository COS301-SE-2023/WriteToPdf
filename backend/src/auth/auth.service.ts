import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDTO } from './dto/refresh_token.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async generateToken(
    username: string,
    password: string,
  ): Promise<any> {
    const payload = {
      username: username,
      password: password,
    };
    return {
      access_token:
        await this.jwtService.signAsync(payload),
      expires_at: new Date(
        new Date().getTime() + 10 * 60000,
      ),
    };
  }

  async refreshToken(
    refreshTokenDTO: RefreshTokenDTO,
  ): Promise<any> {
    try {
      await this.jwtService.verifyAsync(
        refreshTokenDTO.Token,
      );
    } catch {
      throw new UnauthorizedException(
        'Invalid token',
      );
    }

    const payload = {
      username: refreshTokenDTO.Email,
      password: refreshTokenDTO.Token,
    };

    const newRefreshTokenDTO =
      new RefreshTokenDTO();
    newRefreshTokenDTO.UserID =
      refreshTokenDTO.UserID;
    newRefreshTokenDTO.Email =
      refreshTokenDTO.Email;
    newRefreshTokenDTO.Token =
      await this.jwtService.signAsync(payload);
    newRefreshTokenDTO.ExpiresAt = new Date(
      new Date().getTime() + 10 * 60000,
    );

    return newRefreshTokenDTO;
  }
}
