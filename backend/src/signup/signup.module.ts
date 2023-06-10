import { Module } from '@nestjs/common';
import { SignupService } from './signup.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

@Module({
  providers: [
    SignupService,
    UsersService,
    AuthService,
  ],
  exports: [SignupService],
})
export class SignupModule {}
