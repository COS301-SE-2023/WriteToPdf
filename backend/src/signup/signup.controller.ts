import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { SignupService } from './signup.service';
import { SetMetadata } from '@nestjs/common';
import { Request } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () =>
  SetMetadata(IS_PUBLIC_KEY, true);
@Controller('signup')
export class SignupController {
  constructor(
    private signupService: SignupService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post()
  signup(
    @Body() signUpDto: Record<string, any>,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    //TODO replace with actual dto
    return this.signupService.signup(
      signUpDto.username,
      signUpDto.password,
    );
  }
}
