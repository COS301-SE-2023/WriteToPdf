import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';

@Module({
  providers: [
    LoginService,
    AuthService,
    UsersService,
  ],
  exports: [LoginService],
})
export class LoginModule {}
