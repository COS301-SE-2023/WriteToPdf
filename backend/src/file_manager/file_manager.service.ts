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
import { ImportDTO } from './dto/import.dto';
import { ConversionService } from '../conversion/conversion.service';
import { ExportDTO } from './dto/export.dto';

@Injectable()
export class FileManagerService {
  constructor(
    private markdownFilesService: MarkdownFilesService,
    private folderService: FoldersService,
    private s3service: S3Service,
    private conversionService: ConversionService,
  ) {}

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

    // if (markdownFileDTO.Size === undefined)
    //will eventually come from s3 bucket

    return this.markdownFilesService.updateName(
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

  // DB Requires the following fields to be initialised in the DTO:
  // Path: string; .. TO PLACE THE FILE IN S3
  // Name: string; .. THE NEW NAME OF THE FILE
  // Size: number; .. THE SIZE OF THE FILE IN MEGABYTES
  async createFile(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    if (markdownFileDTO.Path === undefined)
      markdownFileDTO.Path = '';

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
  moveFile(markdownFileDTO: MarkdownFileDTO) {
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

    return this.markdownFilesService.updatePath(
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
  // TODO add code to retrieve from S3 for given MarkdownID
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

  deleteFolder(folderDTO: FolderDTO) {
    if (folderDTO.FolderID === undefined)
      throw new HttpException(
        'FolderID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    return this.folderService.remove(folderDTO);
  }

  createFolder(folderDTO: FolderDTO) {
    if (folderDTO.FolderName === undefined)
      throw new HttpException(
        'FolderName cannot be undefined',
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

    return this.folderService.create(folderDTO);
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

  async importFile(importDTO: ImportDTO) {
    if (importDTO.Path === undefined)
      throw new HttpException(
        'Path cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (importDTO.Name === undefined)
      throw new HttpException(
        'Name cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    if (importDTO.Content === undefined)
      throw new HttpException(
        'Content cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    const convertedMardkownFileDTO =
      this.conversionService.convertFrom(
        importDTO,
      );

    const deltaContent =
      convertedMardkownFileDTO.Content;

    const createdFile = await this.createFile(
      convertedMardkownFileDTO,
    );

    createdFile.Content = deltaContent;

    const savedFile = await this.saveFile(
      createdFile,
    );

    const returnedDTO = new MarkdownFileDTO();
    returnedDTO.MarkdownID = savedFile.MarkdownID;
    returnedDTO.UserID = savedFile.UserID;
    returnedDTO.DateCreated =
      savedFile.DateCreated;
    returnedDTO.LastModified =
      savedFile.LastModified;
    returnedDTO.Name = savedFile.Name;
    returnedDTO.Path = savedFile.Path;
    returnedDTO.Size = savedFile.Size;
    returnedDTO.ParentFolderID =
      savedFile.ParentFolderID;
    returnedDTO.Content = deltaContent;

    return returnedDTO;
  }

  async exportFile(exportDTO: ExportDTO) {
    if (exportDTO.MarkdownID === undefined)
      throw new HttpException(
        'MarkdownID cannot be undefined',
        HttpStatus.BAD_REQUEST,
      );

    const convertedDTO =
      this.conversionService.convertTo(exportDTO);

    return convertedDTO;
  }

  /**
   * @param files An array of MarkdownFile entities
   * @returns An array of MarkdownFileDTOs
   */
  convertFilesToDTOs(files: MarkdownFile[]) {
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
    const allFiles =
      await this.markdownFilesService.findAllByUserID(
        directoryFilesDTO.UserID,
      );
    directoryFilesDTO.Files =
      this.convertFilesToDTOs(allFiles);
    return directoryFilesDTO;
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
    const allFolders =
      await this.folderService.findAllByUserID(
        directoryFoldersDTO.UserID,
      );
    directoryFoldersDTO.Folders =
      this.convertFoldersToDTOs(allFolders);
    return directoryFoldersDTO;
  }
}
