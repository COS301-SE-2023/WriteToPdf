import { Injectable } from '@nestjs/common';
import { Folder } from './entities/folder.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FolderDTO } from './dto/folder.dto';

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

  async updateName(updateFolderDTO: FolderDTO) {
    const folder =
      await this.folderRepository.findOne({
        where: {
          FolderID: updateFolderDTO.FolderID,
        },
      });
    folder.FolderName =
      updateFolderDTO.FolderName;
    return this.folderRepository.save(folder);
  }

  async remove(removeFolderDTO: FolderDTO) {
    const folder =
      await this.folderRepository.findOne({
        where: {
          FolderID: removeFolderDTO.FolderID,
        },
      });
    return this.folderRepository.remove(folder);
  }
}
