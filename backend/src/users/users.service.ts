import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { UserDTO } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import * as CryptoJS from 'crypto-js';
import { hashSync, genSaltSync } from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import 'dotenv/config';
import { randomBytes } from 'crypto';
import { ResetPasswordRequestDTO } from '../reset_password/dto/reset_password_request.dto';
import { ResetPasswordService } from '../reset_password/reset_password.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private authService: AuthService,
    private resetPasswordService: ResetPasswordService,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  create(createUserDTO: UserDTO): Promise<User> {
    const pepper = process.env.PEPPER;
    if (!pepper) {
      throw new Error(
        'Pepper value is not defined in the environment variables.',
      );
    }
    createUserDTO.Password = CryptoJS.SHA256(
      createUserDTO.Password + pepper,
      10,
    ).toString();
    const newUser = this.usersRepository.create(
      createUserDTO,
    );
    return this.usersRepository.save(newUser);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find(); // SELECT * FROM users;
  }

  findOne(UserID: number): Promise<User> {
    return this.usersRepository.findOneBy({
      UserID: UserID,
    }); // SELECT * FROM users WHERE UserID = {UserID};
  }

  async findOneByEmail(
    Email: string,
  ): Promise<User> {
    const result =
      await this.usersRepository.findOne({
        where: {
          Email: Email,
        },
      });
    if (!result) {
      this.throwHttpException(
        HttpStatus.NOT_FOUND,
        'User not found',
      );
    }
    return result;
  }

  async findOneByToken(
    token: string,
  ): Promise<User> {
    const result =
      await this.resetPasswordService.findOneByToken(
        token,
      );
    if (!result) {
      this.throwHttpException(
        HttpStatus.NOT_FOUND,
        'Reset password request not found',
      );
    }
    const user =
      await this.usersRepository.findOne({
        where: {
          UserID: result.UserID,
        },
      });
    if (!user) {
      this.throwHttpException(
        HttpStatus.NOT_FOUND,
        'User not found',
      );
    }
    return user;
  }

  throwHttpException(
    httpStatus: HttpStatus,
    message: string,
  ): void {
    throw new HttpException(
      {
        status: httpStatus,
        error: message,
      },
      httpStatus,
    );
  }

  isValidFirstName(firstName: string): boolean {
    return (
      firstName.length > 0 &&
      firstName.length < 50 &&
      // firstName.match(/^[a-zA-Z]+$/)
      /^[A-Za-zÀ-ÖØ-öø-ÿ '-]+$/.test(firstName)
    );
  }

  isValidLastName(lastName: string): boolean {
    return (
      lastName.length > 0 &&
      lastName.length < 50 &&
      // lastName.match(/^[a-zA-Z]+$/)
      /^[A-Za-zÀ-ÖØ-öø-ÿ '-]+$/.test(lastName)
    );
  }

  isValidEmail(email: string): boolean {
    return /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/.test(
      email,
    );
  }

  async signup(
    createUserDTO: UserDTO,
  ): Promise<any> {
    if (
      !this.isValidFirstName(
        createUserDTO.FirstName,
      )
    ) {
      this.throwHttpException(
        HttpStatus.BAD_REQUEST,
        'Invalid first name',
      );
    }

    if (
      !this.isValidLastName(
        createUserDTO.LastName,
      )
    ) {
      this.throwHttpException(
        HttpStatus.BAD_REQUEST,
        'Invalid last name',
      );
    }

    if (!this.isValidEmail(createUserDTO.Email)) {
      this.throwHttpException(
        HttpStatus.BAD_REQUEST,
        'Invalid email',
      );
    }

    let emailExists = false;
    try {
      await this.findOneByEmail(
        createUserDTO.Email,
      );
      emailExists = true;
    } catch (error) {}

    if (emailExists) {
      this.throwHttpException(
        HttpStatus.BAD_REQUEST,
        'Email already exists',
      );
    }

    this.create(createUserDTO);
    return {
      message: 'User created successfully',
    };
  }

  async login(
    loginUserDTO: UserDTO,
  ): Promise<any> {
    let user;
    try {
      user = await this.findOneByEmail(
        loginUserDTO.Email,
      );
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'Invalid credentials',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (
      user?.Password !==
      this.getPepperedPassword(
        loginUserDTO.Password,
      )
    ) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'Invalid credentials',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const token =
      await this.authService.generateToken(user);
    //Create Derived Encryption Key
    const EncryptionKey = CryptoJS.SHA256(
      user.Password,
    ).toString();
    const response = {
      UserID: user.UserID,
      Email: user.Email,
      FirstName: user.FirstName,
      Token: token,
      EncryptionKey: EncryptionKey,
    };
    return response;
  }

  getPepperedPassword(password: string): string {
    const pepper = process.env.PEPPER;

    if (!pepper) {
      throw new Error(
        'Pepper value is not defined in the environment variables.',
      );
    }

    return CryptoJS.SHA256(
      password + pepper,
      10,
    ).toString();
  }

  async googleSignIn(credential: string) {
    // Decode the ID token using JwtService
    const decodedToken =
      await this.verifyGoogleToken(credential);

    if (decodedToken) {
      const { email, given_name, family_name } =
        decodedToken;

      // Check if the user already exists in the database
      let user;
      try {
        user = await this.findOneByEmail(email);
      } catch (error) {
        // If the user does not exist, create a new user
        const newUser = new UserDTO();
        newUser.Email = email;
        newUser.FirstName = given_name;
        newUser.LastName = family_name;
        const salt = this.generateSalt();
        const password =
          this.generateRandomPassword();
        newUser.Salt = salt;
        newUser.Password =
          this.generateHashedPassword(
            password,
            salt,
          );
        user = await this.create(newUser);
      }

      // Generate a token for the user
      const token =
        await this.authService.generateToken(
          user,
        );

      //Create Derived Encryption Key
      const EncryptionKey = CryptoJS.SHA256(
        user.Password,
      ).toString();

      // Return the user information and token
      return {
        UserID: user.UserID,
        Email: user.Email,
        FirstName: user.FirstName,
        Token: token,
        EncryptionKey: EncryptionKey,
      };
    } else {
      throw new HttpException(
        'Invalid credential',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async verifyGoogleToken(token: string) {
    try {
      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
      );
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      return payload;
    } catch (error) {
      throw new HttpException(
        'Invalid credential',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // async update(
  //   updateUserDTO: UserDTO,
  // ): Promise<User> {
  //   const user = await this.findOne(
  //     updateUserDTO.UserID,
  //   );

  //   if (!user) {
  //     this.throwHttpException(
  //       HttpStatus.NOT_FOUND,
  //       'User not found',
  //     );
  // }

  //   return this.usersRepository.save({
  //     ...user,
  //     ...updateUserDTO,
  //   }); // returns updated user
  // }

  // async remove(UserID: number): Promise<User> {
  //   const user = await this.findOne(UserID);
  //   return this.usersRepository.remove(user); // returns deleted user
  // }

  generateSalt(): string {
    return genSaltSync(10);
  }

  generateRandomPassword(): string {
    const randomBytesCount = 4; // 8 string characters
    const randomBytesBuffer = randomBytes(
      randomBytesCount,
    );

    return randomBytesBuffer.toString('hex');
  }

  generateHashedPassword(
    password: string,
    salt: string,
  ): string {
    return hashSync(password, salt);
  }

  async getSalt(userDTO: UserDTO) {
    const user = await this.findOneByEmail(
      userDTO.Email,
    );
    if (!user) {
      this.throwHttpException(
        HttpStatus.NOT_FOUND,
        'User not found',
      );
    }
    const returnedUser = new UserDTO();
    if (user.Salt === '') {
      this.throwHttpException(
        HttpStatus.NOT_FOUND,
        'Salt not found',
      );
      // returnedUser.Salt = process.env.TEST_SALT;
    } else {
      returnedUser.Salt = user.Salt;
    }
    return returnedUser; // returns user with salt
  }

  async resetPassword(
    resetPasswordDTO: ResetPasswordRequestDTO,
  ) {
    const user = await this.findOneByToken(
      resetPasswordDTO.Token,
    );

    const resetRequest =
      await this.resetPasswordService.findOneByTokenAndUserID(
        resetPasswordDTO.Token,
        user.UserID,
      );

    if (!resetRequest) {
      this.throwHttpException(
        HttpStatus.NOT_FOUND,
        'Reset password request not found',
      );
    }

    if (resetRequest.DateExpires < new Date()) {
      this.throwHttpException(
        HttpStatus.BAD_REQUEST,
        'Reset password request expired',
      );
    }

    const payload =
      await this.jwtService.verifyAsync(
        resetRequest.Token,
      );

    if (
      payload.UserID !== user.UserID ||
      payload.DateExpires < new Date()
    ) {
      this.throwHttpException(
        HttpStatus.UNAUTHORIZED,
        'Invalid token',
      );
    }

    user.Password = CryptoJS.SHA256(
      resetPasswordDTO.Password +
        process.env.PEPPER,
      10,
    ).toString();

    await this.usersRepository.save(user);
    await this.resetPasswordService.remove(
      resetRequest,
    );

    return {
      message: 'Password reset successfully',
    };
  }

  async requestResetPassword(userDTO: UserDTO) {
    const user = await this.findOneByEmail(
      userDTO.Email,
    );
    if (!user) {
      this.throwHttpException(
        HttpStatus.NOT_FOUND,
        'User not found',
      );
    }

    const previousRequest =
      await this.resetPasswordService.findOneByUserID(
        user.UserID,
      );

    if (previousRequest) {
      this.throwHttpException(
        HttpStatus.BAD_REQUEST,
        'Reset password request already exists',
      );
    }

    const resetPasswordRequest =
      await this.resetPasswordService.create(
        user.UserID,
        user.Email,
      );

    return await this.sendPasswordResetEmail(
      user.Email,
      resetPasswordRequest.Token,
      user.FirstName,
    );
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    name: string,
  ) {
    const subject = 'WriteToPdf Password Reset';
    const url = `${process.env.FRONTEND_URL}/?token=${token}`;
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
      <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f5f5f5;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #eeeeee;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      h1 {
        color: #333333;
        margin-bottom: 10px;
      }
      p {
        font-size: 16px;
        color: #666666;
        line-height: 1.6;
      }
      a {
        color: #007bff;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
    </head>
    <body>
      <div class="container">
      <img src="https://drive.google.com/uc?export=view&id=1fj8AZDQf8GCQHTrQ08ktpdztz2eJpQdA" alt="App logo" style="width: auto; height: 50px;">
        <h1>Password Reset Request</h1>
        <p>Hello ${name},</p>
        <p>We have received a request to reset your password. If this was not you, then please ignore this email.</p>
        <p>To reset your password, click <a href="${url}">here</a>.</p>
        <p>Thank you,</p>
        <p>WriteToPdf Support Team</p>
        <img src="https://drive.google.com/uc?export=view&id=1fjlBU3wC8d-fQly0D_gxXkbphECBUZL6" alt="Team logo" style="width: auto; height: 30px;">
      </div>
    </body>
    </html>
    `;
    try {
      await this.mailService.sendEmail(
        email,
        subject,
        html,
      );
      return {
        message: 'Password reset email sent',
      };
    } catch (error) {
      throw new HttpException(
        'Password reset email failed: ' +
          error.message,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
