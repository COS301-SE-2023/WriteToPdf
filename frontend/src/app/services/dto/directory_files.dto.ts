import { MarkdownFileDTO } from './markdown_file.dto';

export class DirectoryFilesDTO {
  UserID: number | undefined;
  Files: Array<MarkdownFileDTO> | undefined;

  constructor() {
    this.UserID = undefined;
    this.Files = undefined;
  }
}
