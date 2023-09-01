import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { ResetPasswordService } from '../reset_password/reset_password.service';
import { ResetPasswordRequest } from '../reset_password/entities/reset_password_request.entity';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([
      ResetPasswordRequest,
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    ResetPasswordService,
    MailService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
