import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
      UserID,
    }); // SELECT * FROM users WHERE UserID = {UserID};
  }

  // async findOneByEmail(Email: string) {
  //   return this.usersRepository.findOne({
  //     where: {
  //       Email: Email,
  //     },
  //   });
  // }
  async findOneByEmail(Email: string) {
    console.log('Searching for: ', Email);
    console.log(
      'this.usersRepository: ',
      this.usersRepository,
    );
    const result =
      await this.usersRepository.query(
        'SELECT * FROM USERS WHERE Email = ?',
        [Email],
      );
    console.log('Result: ', result);
    return result[0];
    // result.then((res) => {
    //   console.log('res: ', res);
    //   return res[0];
    // });
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
