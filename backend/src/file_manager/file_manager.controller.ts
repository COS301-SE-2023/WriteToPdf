import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { FileManagerService } from './file_manager.service';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { FolderDTO } from '../folders/dto/folder.dto';
import { DirectoryFoldersDTO } from './dto/directory_folders.dto';
import { DirectoryFilesDTO } from './dto/directory_files.dto';

@Controller('file_manager')
export class FileManagerController {
  constructor(
    private readonly file_manager_service: FileManagerService,
  ) {}

  @Post('create_file')
  @HttpCode(HttpStatus.OK)
  createFile(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      MarkdownFileDTO,
      markdownFileDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.file_manager_service.createFile(
      markdownFileDTO,
    );
  }

  @Post('delete_file')
  @HttpCode(HttpStatus.OK)
  deleteFile(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      MarkdownFileDTO,
      markdownFileDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.file_manager_service.deleteFile(
      markdownFileDTO,
    );
  }

  @Post('rename_file')
  @HttpCode(HttpStatus.OK)
  renameFile(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      MarkdownFileDTO,
      markdownFileDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.file_manager_service.renameFile(
      markdownFileDTO,
    );
  }

  @Post('move_file')
  @HttpCode(HttpStatus.OK)
  moveFile(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      MarkdownFileDTO,
      markdownFileDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.file_manager_service.moveFile(
      markdownFileDTO,
    );
  }

  @Post('create_folder')
  @HttpCode(HttpStatus.OK)
  createFolder(
    @Body()
    folderDTO: FolderDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      FolderDTO,
      folderDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.file_manager_service.createFolder(
      folderDTO,
    );
  }

  @Post('delete_folder')
  @HttpCode(HttpStatus.OK)
  deleteFolder(
    @Body()
    folderDTO: FolderDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      FolderDTO,
      folderDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.file_manager_service.deleteFolder(
      folderDTO,
    );
  }

  @Post('rename_folder')
  @HttpCode(HttpStatus.OK)
  renameFolder(
    @Body()
    folderDTO: FolderDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      FolderDTO,
      folderDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.file_manager_service.renameFolder(
      folderDTO,
    );
  }

  @Post('move_folder')
  @HttpCode(HttpStatus.OK)
  moveFolder(
    @Body()
    folderDTO: FolderDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      FolderDTO,
      folderDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.file_manager_service.moveFolder(
      folderDTO,
    );
  }

  @Post('save_file')
  @HttpCode(HttpStatus.OK)
  save(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      MarkdownFileDTO,
      markdownFileDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.file_manager_service.saveFile(
      markdownFileDTO,
    );
  }

  @Post('retrieve_file')
  @HttpCode(HttpStatus.OK)
  retrieveFile(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      MarkdownFileDTO,
      markdownFileDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.file_manager_service.retrieveFile(
      markdownFileDTO,
    );
  }

  @Post('retrieve_all_files')
  @HttpCode(HttpStatus.OK)
  retrieveAllFiles(
    @Body()
    directoryFilesDTO: DirectoryFilesDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      DirectoryFilesDTO,
      directoryFilesDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.file_manager_service.retrieveAllFiles(
      directoryFilesDTO,
    );
  }

  @Post('retrieve_all_files')
  @HttpCode(HttpStatus.OK)
  retrieveAllFolders(
    @Body()
    directoryFoldersDTO: DirectoryFoldersDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    const receivedDTO = plainToClass(
      DirectoryFoldersDTO,
      directoryFoldersDTO,
    );
    const errors = validateSync(receivedDTO);

    if (errors.length > 0) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.file_manager_service.retrieveAllFolders(
      directoryFoldersDTO,
    );
  }
}
