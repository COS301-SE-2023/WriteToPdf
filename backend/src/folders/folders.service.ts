import { Injectable } from '@nestjs/common';
import { CreateFolderDTO } from './dto/create-folder.dto';
import { UpdateFolderDTO } from './dto/update-folder.dto';
import { Folder } from './entities/folder.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(Folder)
    private folderRepository: Repository<Folder>,
  ) {}

  findAllByUserID(userID: number) {
    return this.folderRepository.find({
      where: { UserID: userID },
    });
  }
}
