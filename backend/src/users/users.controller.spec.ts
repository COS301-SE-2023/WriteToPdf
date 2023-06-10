import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [UsersController],
        providers: [
          UsersService,
          {
            provide: getRepositoryToken(User), // import { getRepositoryToken } from '@nestjs/typeorm';
            useClass: Repository,
          },
        ],
      }).compile();

    controller = module.get<UsersController>(
      UsersController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
