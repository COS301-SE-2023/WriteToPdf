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
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { Public } from '../auth/auth.controller';
import { LoginUserDTO } from './dto/login-user.dto';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  create(@Body() createUserDTO: CreateUserDTO) {
    return this.usersService.create(
      createUserDTO,
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(
    @Body() loginUserDTO: LoginUserDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      LoginUserDTO,
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
    @Body() createUserDTO: CreateUserDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      CreateUserDTO,
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDTO: UpdateUserDTO,
  ) {
    return this.usersService.update(
      +id,
      updateUserDTO,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
