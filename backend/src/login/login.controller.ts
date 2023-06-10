import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { SetMetadata } from '@nestjs/common';
import { Request } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () =>
  SetMetadata(IS_PUBLIC_KEY, true);
@Controller('login')
export class LoginController {
  constructor(
    private loginService: LoginService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post()
  login(
    @Body() logInDto: Record<string, any>,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    //TODO replace with actual dto
    return this.loginService.login(
      logInDto.username,
      logInDto.password,
    );
  }
}
