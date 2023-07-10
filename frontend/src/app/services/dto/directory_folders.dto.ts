import { FolderDTO } from './folder.dto';

export class DirectoryFoldersDTO {
  UserID: number | undefined;
  Folders: Array<FolderDTO> | undefined;

  constructor() {
    this.UserID = undefined;
    this.Folders = undefined;
  }
}
