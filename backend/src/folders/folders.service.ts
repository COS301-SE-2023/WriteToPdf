import { Injectable } from '@nestjs/common';
import { Folder } from './entities/folder.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FolderDTO } from './dto/folder.dto';
import { SHA256 } from 'crypto-js';

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

  async create(createFolderDTO: FolderDTO) {
    const folderID = SHA256(
      createFolderDTO.UserID.toString() +
        new Date().getTime().toString(),
    ).toString();
    createFolderDTO.FolderID = folderID;
    const newFolder = this.folderRepository.save(
      createFolderDTO,
    );
    return newFolder;
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

  async updatePath(updateFolderDTO: FolderDTO) {
    const folder =
      await this.folderRepository.findOne({
        where: {
          FolderID: updateFolderDTO.FolderID,
        },
      });
    folder.Path = updateFolderDTO.Path;
    folder.ParentFolderID =
      updateFolderDTO.ParentFolderID;
    return this.folderRepository.save(folder);
  }
}
