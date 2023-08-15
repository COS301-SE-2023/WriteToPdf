import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './auth.controller';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest();

    // if (request.method !== 'POST') {
    //   throw new UnauthorizedException(
    //     'Method Not Allowed',
    //   );
    // }

    const isPublicEndpoint =
      this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );
    if (isPublicEndpoint) {
      // 💡 See this condition
      return true;
    }

    const token =
      this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(
        'Missing token',
      );
    }
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(
        token,
        {
          secret: process.env.JWT_SECRET_KEY,
        },
      );
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException(
        'Invalid token',
      );
    }
    if (!request.body.UserID) {
      throw new UnauthorizedException(
        'Missing UserID',
      );
    }
    if (
      payload.UserID != request.body.UserID ||
      payload.ExpiresAt < new Date(Date.now())
    ) {
      throw new UnauthorizedException(
        'Invalid token',
      );
    }
    return true;
  }

  private extractTokenFromHeader(
    request: Request,
  ): string | undefined {
    const [type, token] =
      request.headers.authorization?.split(' ') ??
      [];
    return type === 'Bearer' ? token : undefined;
  }
}
