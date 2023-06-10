import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

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

  findOneByEmail(Email: string) {
    return this.usersRepository.findOneBy({
      Email,
    }); // SELECT * FROM users WHERE Email = {Email};
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
