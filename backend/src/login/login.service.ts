import {
  HttpException,
  HttpStatus,
  Injectable,
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
    Email: string,
    pass: string,
  ): Promise<any> {
    const user = await this.usersService.findOneByEmail(
      Email,
    );
    if (user?.Password !== pass) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error:
            user?.Password === undefined
              ? 'User not found'
              : 'Invalid Password',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.authService.generateToken(
      Email,
      pass,
    );
  }
}
