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
import { SignatureDTO } from './dto/signature.dto';
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
      !refreshTokenDTO.Token ||
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

  @Post('sign_checksum')
  @HttpCode(HttpStatus.OK)
  signChecksum(
    @Body() signatureDTO: SignatureDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

    if (
      !signatureDTO.Checksum ||
      !signatureDTO.UserID ||
      !signatureDTO.MarkdownID
    ) {
      throw new HttpException(
        'Invalid request body',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.authService.signChecksum(
      signatureDTO,
    );
  }
}
