import { Module } from '@nestjs/common';
import { SignupService } from './signup.service';

@Module({
  providers: [SignupService],
})
export class SignupModule {}
