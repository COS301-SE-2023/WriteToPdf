import { Injectable } from '@nestjs/common';
import { CreateFileDTO } from './dto/create-file.dto';
import { RenameFileDTO } from './dto/rename-file.dto';
import { DeleteFileDTO } from './dto/delete-file.dto';

@Injectable()
export class FileManagerService {
  renameFile(renameFileDTO: RenameFileDTO) {
    throw new Error('Method not implemented.');
  }
  deleteFile(deleteFileDTO: DeleteFileDTO) {
    throw new Error('Method not implemented.');
  }

  createFile(createFileDTO: CreateFileDTO) {
    return 'This action adds a new file';
  }
}
