import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { FoldersService } from '../folders/folders.service';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { FolderDTO } from '../folders/dto/folder.dto';
import { DirectoryFoldersDTO } from './dto/directory_folders.dto';
import { DirectoryFilesDTO } from './dto/directory_files.dto';
import { MarkdownFile } from '../markdown_files/entities/markdown_file.entity';
import { Folder } from '../folders/entities/folder.entity';
import { S3Service } from '../s3/s3.service';
// import { ImportDTO } from './dto/import.dto';
// import { ConversionService } from '../conversion/conversion.service';
// import { ExportDTO } from './dto/export.dto';
import { UsersService } from '../users/users.service';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class FileManagerService {
  constructor(
    private markdownFilesService: MarkdownFilesService,
    private folderService: FoldersService,
    private s3service: S3Service,
    // private conversionService: ConversionService,
    private userService: UsersService,
  ) {}

  // File operations: ###########################################################

  // DB Requires the following fields to be initialised in the DTO:
  // Path: string; .. TO PLACE THE FILE IN S3
  // Name: string; .. THE NEW NAME OF THE FILE
  // Size: number; .. THE SIZE OF THE FILE IN MEGABYTES
  async createFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    if (markdownFileDTO.UserID === undefined)
      throw new HttpException(
        'UserID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (markdownFileDTO.Path === undefined)
      markdownFileDTO.Path = '';

    if (
      markdownFileDTO.ParentFolderID === undefined
    )
      markdownFileDTO.ParentFolderID = '';

    if (markdownFileDTO.Name === undefined)
      markdownFileDTO.Name = 'New Document';

    if (markdownFileDTO.Size === undefined)
      markdownFileDTO.Size = 0;

    await this.s3service.createFile(
      markdownFileDTO,
    );

    return this.markdownFilesService.create(
      markdownFileDTO,
    ); // return the file to know ID;
  }

  // DB Requires the following fields to be initialised in the DTO:
  async retrieveFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    if (markdownFileDTO.MarkdownID === undefined)
      throw new HttpException(
        'MarkdownID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    await this.s3service.retrieveFile(
      markdownFileDTO,
    );
    return markdownFileDTO; // return the file
  }

  /**
   * @param files An array of MarkdownFile entities
   * @returns An array of MarkdownFileDTOs
   */
  convertFilesToDTOs(
    files: MarkdownFile[],
  ): MarkdownFileDTO[] {
    const markdownFilesDTOArr: MarkdownFileDTO[] =
      [];
    files.forEach((file) => {
      const markdownFileDTO: MarkdownFileDTO = {
        MarkdownID: file.MarkdownID,
        UserID: file.UserID,
        DateCreated: file.DateCreated,
        LastModified: file.LastModified,
        Name: file.Name,
        Path: file.Path,
        Size: file.Size,
        ParentFolderID: file.ParentFolderID,
        Content: '',
      };
      markdownFilesDTOArr.push(markdownFileDTO);
    });
    return markdownFilesDTOArr;
  }

  async retrieveAllFiles(
    directoryFilesDTO: DirectoryFilesDTO,
  ) {
    if (directoryFilesDTO.UserID === undefined)
      throw new HttpException(
        'UserID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    const allFiles =
      await this.markdownFilesService.findAllByUserID(
        directoryFilesDTO.UserID,
      );
    directoryFilesDTO.Files =
      this.convertFilesToDTOs(allFiles);
    return directoryFilesDTO;
  }

  // DB Requires the following fields to be initialised in the DTO:
  // MarkdownID: string; .. TO IDENTIFY THE FILE
  // Path: string; .. TO LOCATE THE FILE in S3
  // Name: string; .. NEW NAME
  // Size: number; .. NEW SIZE
  renameFile(markdownFileDTO: MarkdownFileDTO) {
    if (markdownFileDTO.MarkdownID === undefined)
      throw new HttpException(
        'MarkdownID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (markdownFileDTO.UserID === undefined)
      throw new HttpException(
        'UserID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (markdownFileDTO.Path === undefined)
      throw new HttpException(
        'Path cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (markdownFileDTO.Name === undefined)
      throw new HttpException(
        'Name cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    return this.markdownFilesService.updateName(
      markdownFileDTO,
    );
  }

  // DB Requires the following fields to be initialised in the DTO:
  async moveFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    if (markdownFileDTO.MarkdownID === undefined)
      throw new HttpException(
        'MarkdownID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (markdownFileDTO.Path === undefined)
      throw new HttpException(
        'Path cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (markdownFileDTO.UserID === undefined)
      throw new HttpException(
        'UserID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    return await this.markdownFilesService.updatePath(
      markdownFileDTO,
    );
  }

  // DB Requires the following fields to be initialised in the DTO:
  async saveFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    if (markdownFileDTO.MarkdownID === undefined)
      throw new HttpException(
        'MarkdownID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    await this.s3service.saveFile(
      markdownFileDTO,
    );

    return this.markdownFilesService.updateLastModified(
      markdownFileDTO,
    );
  }
  // DB Requires the following fields to be initialised in the DTO:
  // MarkdownID: string; .. TO IDENTIFY THE FILE
  // Path: string; .. TO LOCATE THE FILE IN S3
  // Name: string; .. TO IDENTIFY THE FILE
  async deleteFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    if (markdownFileDTO.MarkdownID === undefined)
      throw new HttpException(
        'MarkdownID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    await this.s3service.deleteFile(
      markdownFileDTO,
    );

    return this.markdownFilesService.remove(
      markdownFileDTO,
    );
  }

  // Folder operations: #########################################################

  createFolder(folderDTO: FolderDTO) {
    if (folderDTO.FolderName === undefined)
      throw new HttpException(
        'FolderName cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (folderDTO.UserID === undefined)
      throw new HttpException(
        'UserID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (folderDTO.ParentFolderID === undefined)
      throw new HttpException(
        'ParentFolderID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (folderDTO.Path === undefined)
      throw new HttpException(
        'Path cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (folderDTO.FolderName === '') {
      throw new HttpException(
        'FolderName cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.folderService.create(folderDTO);
  }

  convertFoldersToDTOs(folders: Folder[]) {
    const folderDTOArr: FolderDTO[] = [];
    folders.forEach((folder) => {
      const folderDTO: FolderDTO = {
        FolderID: folder.FolderID,
        UserID: folder.UserID,
        DateCreated: folder.DateCreated,
        LastModified: folder.LastModified,
        FolderName: folder.FolderName,
        Path: folder.Path,
        ParentFolderID: folder.ParentFolderID,
      };
      folderDTOArr.push(folderDTO);
    });
    return folderDTOArr;
  }

  async retrieveAllFolders(
    directoryFoldersDTO: DirectoryFoldersDTO,
  ) {
    if (
      directoryFoldersDTO.UserID === undefined
    ) {
      throw new HttpException(
        'UserID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );
    }

    const allFolders =
      await this.folderService.findAllByUserID(
        directoryFoldersDTO.UserID,
      );
    directoryFoldersDTO.Folders =
      this.convertFoldersToDTOs(allFolders);
    return directoryFoldersDTO;
  }

  renameFolder(folderDTO: FolderDTO) {
    if (folderDTO.FolderID === undefined)
      throw new HttpException(
        'FolderID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (folderDTO.FolderName === undefined)
      throw new HttpException(
        'FolderName cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    return this.folderService.updateName(
      folderDTO,
    );
  }

  moveFolder(folderDTO: FolderDTO) {
    if (folderDTO.FolderID === undefined)
      throw new HttpException(
        'FolderID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (folderDTO.ParentFolderID === undefined)
      throw new HttpException(
        'ParentFolderID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (folderDTO.Path === undefined)
      throw new HttpException(
        'Path cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    return this.folderService.updatePath(
      folderDTO,
    );
  }

  deleteFolder(folderDTO: FolderDTO) {
    if (folderDTO.FolderID === undefined)
      throw new HttpException(
        'FolderID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    return this.folderService.remove(folderDTO);
  }

  // Import & Export operations: #########################################################
  // async importFile(importDTO: ImportDTO) {
  //   if (importDTO.Path === undefined)
  //     throw new HttpException(
  //       'Path cannot be undefined',
  //       HttpStatus.BAD_REQUEST,
  //     );

  //   if (importDTO.Name === undefined)
  //     throw new HttpException(
  //       'Name cannot be undefined',
  //       HttpStatus.BAD_REQUEST,
  //     );

  //   if (importDTO.Content === undefined)
  //     throw new HttpException(
  //       'Content cannot be undefined',
  //       HttpStatus.BAD_REQUEST,
  //     );

  //   const encryptionKey =
  //     await this.getEncryptionKey(
  //       importDTO.UserID,
  //     );

  //   importDTO.Content = await this.decryptContent(
  //     importDTO.Content,
  //     encryptionKey,
  //   );
  //   const convertedMarkdownFileDTO =
  //     this.conversionService.convertFrom(
  //       importDTO,
  //     );

  //   convertedMarkdownFileDTO.Content =
  //     await this.encryptContent(
  //       convertedMarkdownFileDTO.Content,
  //       encryptionKey,
  //     );
  //   const deltaContent =
  //     convertedMarkdownFileDTO.Content;

  //   const createdFile = await this.createFile(
  //     convertedMarkdownFileDTO,
  //   );

  //   createdFile.Content = deltaContent;

  //   const savedFile = await this.saveFile(
  //     createdFile,
  //   );

  //   const returnedDTO = new MarkdownFileDTO();
  //   returnedDTO.MarkdownID = savedFile.MarkdownID;
  //   returnedDTO.UserID = savedFile.UserID;
  //   returnedDTO.DateCreated =
  //     savedFile.DateCreated;
  //   returnedDTO.LastModified =
  //     savedFile.LastModified;
  //   returnedDTO.Name = savedFile.Name;
  //   returnedDTO.Path = savedFile.Path;
  //   returnedDTO.Size = savedFile.Size;
  //   returnedDTO.ParentFolderID =
  //     savedFile.ParentFolderID;
  //   returnedDTO.Content = deltaContent;

  //   return returnedDTO;
  // }

  decryptContent(
    content: string | undefined,
    encryptionKey: string,
  ): Promise<string> {
    const decryptedMessage = CryptoJS.AES.decrypt(
      content,
      encryptionKey,
    )
      .toString(CryptoJS.enc.Utf8)
      .replace(/^"(.*)"$/, '$1');
    return decryptedMessage;
  }

  encryptContent(
    content: string,
    encryptionKey: string,
  ) {
    const encryptedMessage = CryptoJS.AES.encrypt(
      content,
      encryptionKey,
    ).toString();
    return encryptedMessage;
  }

  async getEncryptionKey(
    UserID: number,
  ): Promise<string> {
    const user = await this.userService.findOne(
      UserID,
    );

    const encryptionKey = CryptoJS.SHA256(
      user.Password,
    ).toString();

    return encryptionKey;
  }

  // async exportFile(exportDTO: ExportDTO) {
  //   if (exportDTO.MarkdownID === undefined)
  //     throw new HttpException(
  //       'MarkdownID cannot be undefined',
  //       HttpStatus.BAD_REQUEST,
  //     );

  //   if (exportDTO.Content === undefined) {
  //     // Idea for future: if content is undefined, retrieve it from the storage
  //     // const markdownFile =
  //     //   await this.markdownFilesService.findOneByMarkdownID(
  //     //     exportDTO.MarkdownID,
  //     //   );

  //     // if (markdownFile === undefined) {
  //     throw new HttpException(
  //       'Content cannot be undefined',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //     // }

  //     // exportDTO.Content = markdownFile.Content;
  //   }

  //   const encryptionKey =
  //     await this.getEncryptionKey(
  //       exportDTO.UserID,
  //     );

  //   // decrypt content
  //   exportDTO.Content = await this.decryptContent(
  //     exportDTO.Content,
  //     encryptionKey,
  //   );

  //   // convert
  //   const convertedDTO =
  //     this.conversionService.convertTo(exportDTO);

  //   // re-encrypt content
  //   convertedDTO.Content =
  //     await this.encryptContent(
  //       convertedDTO.Content,
  //       encryptionKey,
  //     );

  //   return convertedDTO;
  // }
}
