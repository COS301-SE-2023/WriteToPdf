import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import 'dotenv/config';

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
