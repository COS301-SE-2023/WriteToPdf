import { Injectable } from '@nestjs/common';
import { FoldersService } from '../folders/folders.service';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';

@Injectable()
export class FileManagerService {
  constructor(
    private markdownFilesService: MarkdownFilesService,
    private folderService: FoldersService,
  ) {}
  renameFile(markdownFileDTO: MarkdownFileDTO) {
    return 'File renamed successfully';
  }
  deleteFile(markdownFileDTO: MarkdownFileDTO) {
    return 'File deleted successfully';
  }

  createFile(markdownFileDTO: MarkdownFileDTO) {
    markdownFileDTO.MarkdownID = '1';
    return markdownFileDTO;
  }

  moveFile(markdownFileDTO: MarkdownFileDTO) {
    return 'File moved successfully';
  }

  saveFile(markdownFileDTO: MarkdownFileDTO) {
    return 'File saved successfully';
  }

  retrieveFile(markdownFileDTO: MarkdownFileDTO) {
    return markdownFileDTO;
  }
}
