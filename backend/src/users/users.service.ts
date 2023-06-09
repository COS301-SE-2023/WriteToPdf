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
import { SHA256 } from 'crypto-js';
import * as CryptoJS from 'crypto-js';
import 'dotenv/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private authService: AuthService,
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
      await this.usersRepository.query(
        'SELECT * FROM USERS WHERE Email = ?',
        [Email],
      );
    return result[0];
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
      /^[a-zA-Z]+$/.test(firstName)
    );
  }

  isValidLastName(lastName: string): boolean {
    return (
      lastName.length > 0 &&
      lastName.length < 50 &&
      // lastName.match(/^[a-zA-Z]+$/)
      /^[a-zA-Z]+$/.test(lastName)
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

    const emailExists = await this.findOneByEmail(
      createUserDTO.Email,
    );

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
    const user = await this.findOneByEmail(
      loginUserDTO.Email,
    );
    if (
      user?.Password !==
      this.getPepperedPassword(
        loginUserDTO.Password,
      )
    ) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error:
            user?.Password === undefined
              ? 'User not found'
              : 'Incorrect password',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const token =
      await this.authService.generateToken(
        loginUserDTO.Email,
        loginUserDTO.Password,
      );
    //Create Derived Encryption Key
    const EncryptionKey = SHA256(
      user.Password,
    ).toString();
    //TODO create new DTO for this response
    const response = {
      UserID: user.UserID,
      Email: user.Email,
      FirstName: user.FirstName,
      Token: token.access_token,
      ExpiresAt: token.expires_at,
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
}
