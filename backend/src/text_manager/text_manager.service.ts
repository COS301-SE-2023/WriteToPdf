import { Injectable } from '@nestjs/common';
import { CreateTextManagerDto } from './dto/create-text_manager.dto';
import { UpdateTextManagerDto } from './dto/update-text_manager.dto';

@Injectable()
export class TextManagerService {
  create(
    createTextManagerDto: CreateTextManagerDto,
  ) {
    return 'This action adds a new textManager';
  }

  findAll() {
    return `This action returns all textManager`;
  }

  findOne(id: number) {
    return `This action returns a #${id} textManager`;
  }

  update(
    id: number,
    updateTextManagerDto: UpdateTextManagerDto,
  ) {
    return `This action updates a #${id} textManager`;
  }

  remove(id: number) {
    return `This action removes a #${id} textManager`;
  }
}
