import { Module } from '@nestjs/common';
import { LoginService } from './login.service';

@Module({
  providers: [LoginService],
})
export class LoginModule {}
