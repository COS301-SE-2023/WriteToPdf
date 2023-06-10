import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
@Injectable()
export class SignupService {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  async signup(
    username: string,
    password: string,
  ): Promise<any> {
    const user = await this.usersService.findOne(
      username,
    );
    if (user !== undefined) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'User already exists',
        },
        HttpStatus.CONFLICT,
      );
    }
    //TODO add user to database
    return this.authService.generateToken(
      username,
      password,
    );
  }
}
