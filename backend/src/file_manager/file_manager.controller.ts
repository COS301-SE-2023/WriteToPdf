import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { FileManagerService } from './file_manager.service';
import { CreateFileDTO } from './dto/create-file.dto';
import { DeleteFileDTO } from './dto/delete-file.dto';
import { RenameFileDTO } from './dto/rename-file.dto';

@Controller('file-manager')
export class FileManagerController {
  constructor(
    private readonly file_manager_service: FileManagerService,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  create(
    @Body()
    createFileDTO: CreateFileDTO,
  ) {
    return this.file_manager_service.createFile(
      createFileDTO,
    );
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  delete(
    @Body()
    deleteFileDTO: DeleteFileDTO,
  ) {
    return this.file_manager_service.deleteFile(
      deleteFileDTO,
    );
  }

  @Post('rename')
  @HttpCode(HttpStatus.OK)
  rename(
    @Body()
    renameFileDTO: RenameFileDTO,
  ) {
    return this.file_manager_service.renameFile(
      renameFileDTO,
    );
  }
}
