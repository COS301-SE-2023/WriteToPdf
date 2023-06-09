import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

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
    };
  }
}
