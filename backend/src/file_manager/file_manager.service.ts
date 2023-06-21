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

@Injectable()
export class FileManagerService {
  constructor(
    private markdownFilesService: MarkdownFilesService,
    private folderService: FoldersService,
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
      markdownFileDTO.MarkdownID,
      markdownFileDTO,
    );
  }

  // DB Requires the following fields to be initialised in the DTO:
  // MarkdownID: string; .. TO IDENTIFY THE FILE
  // Path: string; .. TO LOCATE THE FILE IN S3
  // Name: string; .. TO IDENTIFY THE FILE
  deleteFile(markdownFileDTO: MarkdownFileDTO) {
    return this.markdownFilesService.remove(
      markdownFileDTO,
    );
  }

  // DB Requires the following fields to be initialised in the DTO:
  // Path: string; .. TO PLACE THE FILE IN S3
  // Name: string; .. THE NEW NAME OF THE FILE
  // Size: number; .. THE SIZE OF THE FILE IN MEGABYTES
  createFile(markdownFileDTO: MarkdownFileDTO) {
    if (markdownFileDTO.Path === undefined)
      markdownFileDTO.Path = 'root';

    if (markdownFileDTO.Name === undefined)
      markdownFileDTO.Name = 'New Document';

    if (markdownFileDTO.Size === undefined)
      markdownFileDTO.Size = 0;

    return this.markdownFilesService.create(
      markdownFileDTO,
    ); // return the file to know ID;
  }

  // DB Requires the following fields to be initialised in the DTO:
  moveFile(markdownFileDTO: MarkdownFileDTO) {
    return 'File moved successfully';
  }

  // DB Requires the following fields to be initialised in the DTO:
  saveFile(markdownFileDTO: MarkdownFileDTO) {
    return 'File saved successfully';
  }

  // DB Requires the following fields to be initialised in the DTO:
  retrieveFile(markdownFileDTO: MarkdownFileDTO) {
    return markdownFileDTO; // return the file
  }

  renameFolder(folderDTO: FolderDTO) {
    return 'File renamed successfully';
  }

  deleteFolder(folderDTO: FolderDTO) {
    return 'File deleted successfully';
  }

  createFolder(folderDTO: FolderDTO) {
    folderDTO.FolderID = '1';
    return folderDTO;
  }

  moveFolder(folderDTO: FolderDTO) {
    return 'File moved successfully';
  }

  retrieveAllFolders(
    directoryFoldersDTO: DirectoryFoldersDTO,
  ) {
    return directoryFoldersDTO;
  }

  /**
   *
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
}
