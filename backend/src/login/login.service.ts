import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class LoginService {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  async login(
    username: string,
    pass: string,
  ): Promise<any> {
    const user = await this.usersService.findOne(
      username,
    );
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    return this.authService.generateToken(
      username,
      pass,
    );
  }
}
