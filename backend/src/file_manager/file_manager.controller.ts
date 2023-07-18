import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Request,
} from '@nestjs/common';
import { FileManagerService } from './file_manager.service';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { FolderDTO } from '../folders/dto/folder.dto';
import { DirectoryFoldersDTO } from './dto/directory_folders.dto';
import { DirectoryFilesDTO } from './dto/directory_files.dto';
import { ImportDTO } from './dto/import.dto';
import { ExportDTO } from './dto/export.dto';

@Controller('file_manager')
export class FileManagerController {
  constructor(
    private readonly fileManagerService: FileManagerService,
  ) {}

  // File operations #################################################
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

    if (!markdownFileDTO.UserID)
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.fileManagerService.createFile(
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

    if (
      !markdownFileDTO.UserID ||
      !markdownFileDTO.MarkdownID
    )
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.fileManagerService.deleteFile(
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

    if (
      !markdownFileDTO.UserID ||
      !markdownFileDTO.MarkdownID ||
      !markdownFileDTO.Name
    )
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.fileManagerService.renameFile(
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

    if (
      !markdownFileDTO.UserID ||
      !markdownFileDTO.MarkdownID ||
      !markdownFileDTO.ParentFolderID ||
      !markdownFileDTO.Path
    )
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.fileManagerService.moveFile(
      markdownFileDTO,
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

    if (
      !markdownFileDTO.UserID ||
      !markdownFileDTO.MarkdownID ||
      !markdownFileDTO.Content
    )
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.fileManagerService.saveFile(
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

    if (
      !markdownFileDTO.UserID ||
      !markdownFileDTO.MarkdownID
    )
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.fileManagerService.retrieveFile(
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

    if (!directoryFilesDTO.UserID)
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.fileManagerService.retrieveAllFiles(
      directoryFilesDTO,
    );
  }

  // Folder operations #################################################
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

    if (
      !folderDTO.UserID ||
      !folderDTO.FolderName ||
      !folderDTO.Path
    )
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.fileManagerService.createFolder(
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

    if (!folderDTO.UserID || !folderDTO.FolderID)
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.fileManagerService.deleteFolder(
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
    if (
      !folderDTO.UserID ||
      !folderDTO.FolderID ||
      !folderDTO.FolderName
    )
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.fileManagerService.renameFolder(
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

    if (
      !folderDTO.UserID ||
      !folderDTO.FolderID ||
      !folderDTO.ParentFolderID ||
      !folderDTO.Path
    )
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.fileManagerService.moveFolder(
      folderDTO,
    );
  }

  @Post('retrieve_all_folders')
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

    if (!directoryFoldersDTO.UserID)
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.fileManagerService.retrieveAllFolders(
      directoryFoldersDTO,
    );
  }

  // Import & Export operations #################################################
  // TODO: deprecated REMOVE
  @Post('import')
  @HttpCode(HttpStatus.OK)
  import(
    @Body()
    importDTO: ImportDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

    if (
      !importDTO.UserID ||
      !importDTO.Type ||
      !importDTO.Content ||
      !importDTO.ParentFolderID ||
      !importDTO.Path ||
      !importDTO.Name
    )
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.fileManagerService.importFile(
      importDTO,
    );
  }

  // TODO: deprecated REMOVE
  @Post('export')
  @HttpCode(HttpStatus.OK)
  export(
    @Body()
    exportDTO: ExportDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

    if (
      !exportDTO.UserID ||
      !exportDTO.Type ||
      !exportDTO.MarkdownID
    )
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.fileManagerService.exportFile(
      exportDTO,
    );
  }
}
