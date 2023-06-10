import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

@Module({
  providers: [
    LoginService,
    AuthService,
    UsersService,
    {
      provide: getRepositoryToken(User),
      useClass: Repository,
    },
  ],
  exports: [LoginService],
})
export class LoginModule {}
