import { Injectable } from '@nestjs/common';
import { CreateImageManagerDto } from './dto/create-image_manager.dto';
import { UpdateImageManagerDto } from './dto/update-image_manager.dto';

@Injectable()
export class ImageManagerService {
  create(
    createImageManagerDto: CreateImageManagerDto,
  ) {
    return 'This action adds a new imageManager';
  }

  findAll() {
    return `This action returns all imageManager`;
  }

  findOne(id: number) {
    return `This action returns a #${id} imageManager`;
  }

  update(
    id: number,
    updateImageManagerDto: UpdateImageManagerDto,
  ) {
    return `This action updates a #${id} imageManager`;
  }

  remove(id: number) {
    return `This action removes a #${id} imageManager`;
  }
}
