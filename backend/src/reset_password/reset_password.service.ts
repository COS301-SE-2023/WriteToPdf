import { Injectable } from '@nestjs/common';
import { ResetPasswordRequest } from './entities/reset_password_request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ResetPasswordService {
  constructor(
    @InjectRepository(ResetPasswordRequest)
    private resetPasswordRequestRepository: Repository<ResetPasswordRequest>,
    private jwtService: JwtService,
  ) {}

  async findOneByToken(
    token: string,
  ): Promise<ResetPasswordRequest> {
    return await this.resetPasswordRequestRepository.findOne(
      {
        where: {
          Token: token,
        },
      },
    );
  }

  async findOneByTokenAndUserID(
    token: string,
    userID: number,
  ): Promise<ResetPasswordRequest> {
    return await this.resetPasswordRequestRepository.findOne(
      {
        where: {
          Token: token,
          UserID: userID,
        },
      },
    );
  }

  async remove(
    resetRequest: ResetPasswordRequest,
  ): Promise<void> {
    await this.resetPasswordRequestRepository.remove(
      resetRequest,
    );
  }

  async create(
    userID: number,
  ): Promise<ResetPasswordRequest> {
    const resetRequest =
      new ResetPasswordRequest();
    resetRequest.UserID = userID;
    resetRequest.Token = await this.generateToken(
      userID,
      resetRequest.DateExpires,
    );
    return await this.resetPasswordRequestRepository.save(
      resetRequest,
    );
  }

  async generateToken(
    userID: number,
    dateExpires: Date,
  ): Promise<string> {
    const token = await this.jwtService.signAsync(
      {
        UserID: userID,
        DateExpires: dateExpires,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '24h',
      },
    );
    return token;
  }
}
