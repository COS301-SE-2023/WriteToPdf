import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDTO } from './dto/refresh_token.dto';
import { SignatureDTO } from './dto/signature.dto';
import { UserDTO } from '../users/dto/user.dto';
import * as EC from 'elliptic';

@Injectable()
export class AuthService {
  ellipticCurve = new EC.ec('secp256k1');
  constructor(private jwtService: JwtService) {}

  async generateToken(
    userDTO: UserDTO,
  ): Promise<any> {
    const payload = {
      UserID: userDTO.UserID,
      ExpiresAt: new Date(
        new Date().getTime() + 10 * 60000,
      ), // 10 minutes
    };
    return await this.jwtService.signAsync(
      payload,
    );
  }

  async refreshToken(
    refreshTokenDTO: RefreshTokenDTO,
  ): Promise<any> {
    let oldPayload;
    try {
      oldPayload =
        await this.jwtService.verifyAsync(
          refreshTokenDTO.Token,
        );
    } catch {
      throw new UnauthorizedException(
        'Invalid token',
      );
    }

    if (
      oldPayload.UserID !=
        refreshTokenDTO.UserID ||
      oldPayload.ExpiresAt < new Date(Date.now())
    ) {
      throw new UnauthorizedException(
        'Invalid token',
      );
    }

    const newPayload = {
      UserID: refreshTokenDTO.UserID,
      ExpiresAt: new Date(
        new Date().getTime() + 10 * 60000,
      ), // 10 minutes
    };

    const newRefreshTokenDTO =
      new RefreshTokenDTO();
    newRefreshTokenDTO.UserID =
      refreshTokenDTO.UserID;
    newRefreshTokenDTO.Token =
      await this.jwtService.signAsync(newPayload);

    return newRefreshTokenDTO;
  }

  signChecksum(signatureDTO: SignatureDTO) {
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const key = this.ellipticCurve.keyFromPrivate(
      PRIVATE_KEY,
      'hex',
    );
    const signedChecksum = key.sign(
      signatureDTO.Checksum,
    );
    signatureDTO.Signature =
      signedChecksum.toDER('hex');
    return signatureDTO;
  }
}
