import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  SetMetadata,
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
    const receivedDTO = plainToClass(
      RefreshTokenDTO,
      refreshTokenDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (refreshTokenDTO.UserID === undefined)
      throw new HttpException(
        'UserID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    return this.authService.refreshToken(
      refreshTokenDTO,
    );
  }
}
