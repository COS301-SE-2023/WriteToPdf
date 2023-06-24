import { FolderDTO } from '../../folders/dto/folder.dto';

export class DirectoryFoldersDTO {
  UserID: number;
  Folders: Array<FolderDTO>;

  constructor() {
    this.UserID = undefined;
    this.Folders = undefined;
  }
}
