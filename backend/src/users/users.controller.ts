import {
  Controller,
  Post,
  Body,
  Req,
  HttpStatus,
  HttpException,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDTO } from './dto/user.dto';
import { Public } from '../auth/auth.controller';
import { Request } from 'express';
import { ResetPasswordRequestDTO } from '../reset_password/dto/reset_password_request.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(
    @Body() loginUserDTO: UserDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    // Check whether request body contains at least email and password
    if (
      !loginUserDTO.Email ||
      !loginUserDTO.Password
    ) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.usersService.login(loginUserDTO);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('get_salt')
  getSalt(
    @Body() userDTO: UserDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

    if (!userDTO.Email) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.usersService.getSalt(userDTO);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signup')
  signup(
    @Body() createUserDTO: UserDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

    if (
      !createUserDTO.Email ||
      !createUserDTO.Password ||
      !createUserDTO.FirstName ||
      !createUserDTO.LastName
    ) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.usersService.signup(
      createUserDTO,
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('google_signin')
  googleSignIn(
    @Body() body: any,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

    if (!body.credential) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.usersService.googleSignIn(
      body.credential,
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('reset_password')
  resetPassword(
    @Body() resetDTO: ResetPasswordRequestDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

    if (!resetDTO.Token || !resetDTO.Password) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.usersService.resetPassword(
      resetDTO,
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('request_reset_password')
  requestResetPassword(
    @Body() resetDTO: UserDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

    if (!resetDTO.Email) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.usersService.requestResetPassword(
      resetDTO,
    );
  }
}
