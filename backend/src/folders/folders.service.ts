import { Injectable } from '@nestjs/common';
import { CreateFolderDTO } from './dto/create-folder.dto';
import { UpdateFolderDTO } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  create(createFolderDTO: CreateFolderDTO) {
    return 'This action adds a new folder';
  }

  findAll() {
    return `This action returns all folders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} folder`;
  }

  update(
    id: number,
    updateFolderDTO: UpdateFolderDTO,
  ) {
    return `This action updates a #${id} folder`;
  }

  remove(id: number) {
    return `This action removes a #${id} folder`;
  }
}
