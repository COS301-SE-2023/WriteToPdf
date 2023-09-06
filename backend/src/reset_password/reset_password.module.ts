import { Module } from '@nestjs/common';
import { ResetPasswordService } from './reset_password.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResetPasswordRequest } from './entities/reset_password_request.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResetPasswordRequest,
    ]),
  ],
  providers: [ResetPasswordService, JwtService],
  exports: [ResetPasswordService],
})
export class ResetPasswordModule {}
