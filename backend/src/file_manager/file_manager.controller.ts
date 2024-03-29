import {
  Body,
  Controller,
  Headers,
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
import { ExportDTO } from './dto/export.dto';
import { ImportDTO } from './dto/import.dto';
import { ShareRequestDTO } from './dto/share_request.dto';

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
    @Headers('isTest') isTest: string, // For using mocked out services
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
      isTest && isTest === 'true' ? true : false,
    );
  }

  @Post('delete_file')
  @HttpCode(HttpStatus.OK)
  deleteFile(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
    @Req() request: Request,
    @Headers('isTest') isTest: string, // For using mocked out services
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
      isTest && isTest === 'true' ? true : false,
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
      (!markdownFileDTO.ParentFolderID &&
        markdownFileDTO.ParentFolderID !== '') ||
      (!markdownFileDTO.Path &&
        markdownFileDTO.Path !== '')
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
    @Headers('isTest') isTest: string, // For using mocked out services
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
      (!markdownFileDTO.Content &&
        markdownFileDTO.Content !== '')
    )
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.fileManagerService.saveFile(
      markdownFileDTO,
      isTest && isTest === 'true' ? true : false,
    );
  }

  @Post('retrieve_file')
  @HttpCode(HttpStatus.OK)
  retrieveFile(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
    @Req() request: Request,
    @Headers('isTest') isTest: string, // For using mocked out services
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
      isTest && isTest === 'true' ? true : false,
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

  @Post('update_safelock_status')
  @HttpCode(HttpStatus.OK)
  updateSafeLockStatus(
    @Body()
    markdownFileDTO: MarkdownFileDTO,
    @Req() request: Request,
    // @Headers('isTest') isTest: string, // For using mocked out services
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
      markdownFileDTO.SafeLock === undefined
    ) {
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.fileManagerService.updateSafeLockStatus(
      markdownFileDTO,
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
      (!folderDTO.Path && folderDTO.Path !== '')
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
      (!folderDTO.ParentFolderID &&
        folderDTO.ParentFolderID !== '') ||
      (!folderDTO.Path && folderDTO.Path !== '')
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

  @Post('import')
  @HttpCode(HttpStatus.OK)
  import(
    @Body()
    importDTO: ImportDTO,
    @Req() request: Request,
    @Headers('isTest') isTest: string, // For using mocked out services
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
      (!importDTO.ParentFolderID &&
        importDTO.ParentFolderID !== '') ||
      (!importDTO.Path &&
        importDTO.Path !== '') ||
      !importDTO.Name
    )
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.fileManagerService.importFile(
      importDTO,
      isTest && isTest === 'true' ? true : false,
    );
  }

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

  @Post('share')
  @HttpCode(HttpStatus.OK)
  share(
    @Body()
    shareRequestDTO: ShareRequestDTO,
    @Req() request: Request,
  ) {
    if (request.method !== 'POST') {
      throw new HttpException(
        'Method Not Allowed',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

    if (
      !shareRequestDTO.UserID ||
      !shareRequestDTO.MarkdownID ||
      !shareRequestDTO.RecipientEmail
    )
      throw new HttpException(
        'Invalid request data',
        HttpStatus.BAD_REQUEST,
      );

    return this.fileManagerService.shareFile(
      shareRequestDTO,
    );
  }
}
