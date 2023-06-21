import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpStatus,
  HttpException,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDTO } from './dto/user.dto';
import { Public } from '../auth/auth.controller';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  create(@Body() createUserDTO: UserDTO) {
    return this.usersService.create(
      createUserDTO,
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(
    @Body() loginUserDTO: UserDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      UserDTO,
      loginUserDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.usersService.login(loginUserDTO);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signup')
  signup(
    @Body() createUserDTO: UserDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      UserDTO,
      createUserDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.usersService.signup(
      createUserDTO,
    );
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':UserID')
  findOne(@Param('UserID') UserID: number) {
    return this.usersService.findOne(UserID);
  }

  @Patch(':UserID')
  update(
    @Param('UserID') UserID: number,
    @Body() updateUserDTO: UserDTO,
  ) {
    return this.usersService.update(
      UserID,
      updateUserDTO,
    );
  }

  @Delete(':UserID')
  remove(@Param('UserID') UserID: number) {
    return this.usersService.remove(UserID);
  }
}
