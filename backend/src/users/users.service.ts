import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { LoginUserDTO } from './dto/login-user.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  create(createUserDto: CreateUserDto) {
    const newUser = this.usersRepository.create(
      createUserDto,
    );
    return this.usersRepository.save(newUser);
  }

  findAll() {
    return this.usersRepository.find(); // SELECT * FROM users;
  }

  findOne(UserID: number) {
    return this.usersRepository.findOneBy({
      UserID: UserID,
    }); // SELECT * FROM users WHERE UserID = {UserID};
  }

  async findOneByEmail(Email: string) {
    const result =
      await this.usersRepository.query(
        'SELECT * FROM USERS WHERE Email = ?',
        [Email],
      );
    return result[0];
  }

  async login(loginUserDto: LoginUserDTO) {
    const user = await this.findOneByEmail(
      loginUserDto.Email,
    );
    if (
      user?.Password !== loginUserDto.Password
    ) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error:
            user?.Password === undefined
              ? 'User not found'
              : 'Invalid Password',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const token =
      await this.authService.generateToken(
        loginUserDto.Email,
        loginUserDto.Password,
      );
    const response = {
      UserID: user.UserID,
      Email: user.Email,
      Token: token.access_token,
    };
    return response;
  }

  async update(
    UserID: number,
    updateUserDto: UpdateUserDto,
  ) {
    const user = await this.findOne(UserID);
    return this.usersRepository.save({
      ...user,
      ...updateUserDto,
    }); // returns updated user
  }

  async remove(UserID: number) {
    const user = await this.findOne(UserID);
    return this.usersRepository.remove(user); // returns deleted user
  }
}
