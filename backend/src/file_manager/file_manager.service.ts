import { Injectable } from '@nestjs/common';
import { MarkdownFileDTO } from 'src/markdown_files/dto/markdown_file.dto';

@Injectable()
export class FileManagerService {
  renameFile(markdownFileDTO: MarkdownFileDTO) {
    return 'This action renames a file';
  }
  deleteFile(markdownFileDTO: MarkdownFileDTO) {
    return 'This action deletes a file';
  }

  createFile(markdownFileDTO: MarkdownFileDTO) {
    return 'This action adds a new file';
  }

  moveFile(markdownFileDTO: MarkdownFileDTO) {
    return 'This action moves a file';
  }
}
