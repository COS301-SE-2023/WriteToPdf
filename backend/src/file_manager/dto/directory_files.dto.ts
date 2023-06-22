import { MarkdownFileDTO } from '../../markdown_files/dto/markdown_file.dto';

export class DirectoryFilesDTO {
  UserID: number;
  Files: Array<MarkdownFileDTO>;

  constructor() {
    this.UserID = undefined;
    this.Files = undefined;
  }
}
