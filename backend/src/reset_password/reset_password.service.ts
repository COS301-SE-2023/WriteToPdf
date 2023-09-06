import { Injectable } from '@nestjs/common';
import { ResetPasswordRequest } from './entities/reset_password_request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
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

  async findOneByUserID(
    userID: number,
  ): Promise<ResetPasswordRequest> {
    await this.resetPasswordRequestRepository.delete(
      {
        UserID: userID,
        DateExpires: LessThan(new Date()),
      },
    );

    return await this.resetPasswordRequestRepository.findOne(
      {
        where: {
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
    email: string,
  ): Promise<ResetPasswordRequest> {
    const resetRequest =
      new ResetPasswordRequest();
    resetRequest.UserID = userID;
    resetRequest.Token = await this.generateToken(
      userID,
      email,
      resetRequest.DateExpires,
    );
    return await this.resetPasswordRequestRepository.save(
      resetRequest,
    );
  }

  async generateToken(
    userID: number,
    email: string,
    dateExpires: Date,
  ): Promise<string> {
    const token = await this.jwtService.signAsync(
      {
        UserID: userID,
        Email: email,
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
