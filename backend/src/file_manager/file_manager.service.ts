import { Injectable } from '@nestjs/common';
import { FoldersService } from '../folders/folders.service';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { FolderDTO } from 'src/folders/dto/folder.dto';

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
    // return 'File renamed successfully';
    return this.markdownFilesService.update(
      markdownFileDTO.MarkdownID,
      markdownFileDTO,
    );
  }

  // DB Requires the following fields to be initialised in the DTO:
  // MarkdownID: string; .. TO IDENTIFY THE FILE
  // Path: string; .. TO LOCATE THE FILE IN S3
  // Name: string; .. TO IDENTIFY THE FILE
  deleteFile(markdownFileDTO: MarkdownFileDTO) {
    return 'File deleted successfully';
  }

  // DB Requires the following fields to be initialised in the DTO:
  // Path: string; .. TO PLACE THE FILE IN S3
  // Name: string; .. THE NEW NAME OF THE FILE
  // Size: number; .. THE SIZE OF THE FILE IN MEGABYTES
  createFile(markdownFileDTO: MarkdownFileDTO) {
    markdownFileDTO.MarkdownID = '1';
    return markdownFileDTO; // return the file to know ID;
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
}
