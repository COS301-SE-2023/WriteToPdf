import { Injectable } from '@nestjs/common';
import { MarkdownFileDTO } from 'src/markdown_files/dto/markdown_file.dto';

@Injectable()
export class FileManagerService {
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
