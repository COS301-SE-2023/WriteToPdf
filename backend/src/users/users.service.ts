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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  create(createUserDTO: UserDTO): Promise<User> {
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

  // isValidEmail(email: string) {
  //   if (
  //     !email.match(
  //       /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$/,
  //     )
  //   )
  //     return false;
  //   return true;
  // }

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
      user?.Password !== loginUserDTO.Password
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
    //TODO create new DTO for this response
    const response = {
      UserID: user.UserID,
      Email: user.Email,
      Token: token.access_token,
    };
    return response;
  }

  async update(
    UserID: number,
    updateUserDTO: UserDTO,
  ): Promise<User> {
    const user = await this.findOne(UserID);
    return this.usersRepository.save({
      ...user,
      ...updateUserDTO,
    }); // returns updated user
  }

  async remove(UserID: number): Promise<User> {
    const user = await this.findOne(UserID);
    return this.usersRepository.remove(user); // returns deleted user
  }

  async getSalt(userDTO: UserDTO) {
    const user = await this.findOneByEmail(
      userDTO.Email,
    );
    const returnedUser = new UserDTO();
    returnedUser.Salt = user.Salt;
    return returnedUser; // returns user with salt
  }
}
