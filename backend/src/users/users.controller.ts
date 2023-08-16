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
import { JwtService } from '@nestjs/jwt';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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
    const idToken = body.credential; // Assuming 'credential' field contains the ID token

    // Decode the ID token using JwtService
    const decodedToken = this.jwtService.decode(
      idToken,
    ) as {
      email: string;
      given_name: string;
      family_name: string;
    };

    if (decodedToken) {
      const { email, given_name, family_name } =
        decodedToken;

      console.log('Email:', email);
      console.log('First Name:', given_name);
      console.log('Last Name:', family_name);

      return true; // Return any response you want
    } else {
      console.error(
        'Invalid token or payload missing',
      );
      return false; // Return any response you want for error case
    }
  }
}
