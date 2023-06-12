import { Module } from '@nestjs/common';
import { SignupService } from './signup.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

@Module({
  providers: [
    SignupService,
    UsersService,
    AuthService,
    {
      provide: getRepositoryToken(User),
      useClass: Repository,
    },
  ],
  exports: [SignupService],
})
export class SignupModule {}
