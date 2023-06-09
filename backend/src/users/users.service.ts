import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'test',
      password: '123456',
    },
  ]; //TODO replace with real database

  async findOne(
    username: string,
  ): Promise<User | undefined> {
    return this.users.find(
      (user) => user.username === username,
    );
  }
}
