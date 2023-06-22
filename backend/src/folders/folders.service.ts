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

  create(createFolderDTO: CreateFolderDTO) {
    return 'This action adds a new folder';
  }

  findAll() {
    return `This action returns all folders`;
  }

  findOne(FolderID: string) {
    return `This action returns a #${FolderID} folder`;
  }

  update(
    FolderID: string,
    updateFolderDTO: UpdateFolderDTO,
  ) {
    return `This action updates a #${FolderID} folder`;
  }

  remove(FolderID: string) {
    return `This action removes a #${FolderID} folder`;
  }

  findAllByUserID(userID: number) {
    return this.folderRepository.find({
      where: { UserID: userID },
    });
  }
}
