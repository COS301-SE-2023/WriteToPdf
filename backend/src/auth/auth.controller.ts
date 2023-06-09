import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  SetMetadata,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenDTO } from './dto/refresh_token.dto';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () =>
  SetMetadata(IS_PUBLIC_KEY, true);

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('refresh_token')
  @HttpCode(HttpStatus.OK)
  refreshToken(
    @Body() refreshTokenDTO: RefreshTokenDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

    if (
      !refreshTokenDTO.Email ||
      !refreshTokenDTO.Token ||
      !refreshTokenDTO.ExpiresAt ||
      !refreshTokenDTO.UserID
    ) {
      throw new HttpException(
        'Invalid request body',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.authService.refreshToken(
      refreshTokenDTO,
    );
  }
}
