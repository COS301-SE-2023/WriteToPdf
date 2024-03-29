import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { DirectoryFilesDTO } from './dto/directory_files.dto';
import { DirectoryFoldersDTO } from './dto/directory_folders.dto';
import { UserService } from './user.service';
import { HttpResponse } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MarkdownFileDTO } from './dto/markdown_file.dto';
import { FolderDTO } from './dto/folder.dto';
import { FileService } from './file.service';
import { FolderService } from './folder.service';

/**
 * @Backend - the functions in this file serve as dummy data for the values of the directory contents.
 * Please code your API to deliver the database's information in the same format.
 */

@Injectable()
export class NodeService {
  constructor(
    private userService: UserService,
    private http: HttpClient,
    private fileService: FileService,
    private folderService: FolderService
  ) { }

  private files: MarkdownFileDTO[] = [];
  private folders: FolderDTO[] = [];
  private nameNumber = 0;

  private folderIcon = 'c-icons folder-icon';
  private fileIcon = 'c-icons doc-icon';

  /**
   * @Backend, below is a function with data that showcases the
   * format we need the TreeTable information to be delivered to us for seamless integration
   * into the PrimeNG component. Not to be confused with the format of the Tree.
   */

  //What each folder object will look like:
  typicalFolder = {
    key: '0', //some unique identifier
    data: {
      name: 'folderName',
      size: '100kb',
      type: 'Folder',
    },
    children: [
      {
        //contains other folders/files
      },
    ], //The above 3 attributes are required for the TreeTable to work. The below is the data related to the folder
    FolderID: '0', //FolderID from the database
    DateCreated: '2023-06-24', //DateCreated from the database
    LastModified: '2023-06-24', //DateModified from the database
    ParentFolderID: '0', //ParentID from the database
    Path: 'C:/Users/...', //Path from the database
  };

  //What each file object will look like:
  typicalFile = {
    key: '0', //some unique identifier
    data: {
      name: 'fileName',
      size: '100kb',
      type: 'File',
    }, //The above 2 attributes are required for the TreeTable to work. The below is the data related to the file
    FileID: '0', //FileID from the database
    DateCreated: '2023-06-24', //DateCreated from the database
    LastModified: '2023-06-24', //DateModified from the database
    ParentFolderID: '0', //ParentID from the database
    Path: 'C:/Users/...', //Path from the database
    Content: 'This is the content of the file', //Content from the database
  };

  getTreeTableNodesData(): any {
    let directoryObject: {
      key: string | undefined;
      icon: string | undefined;
      data: {
        name: string | undefined;
        size: string | undefined;
        type: string | undefined;
        key: string | undefined;
      };
      children?: [{}];
    }[] = [];

    // for(const file of this.files){
    //   directoryObject.push({
    //     key: file.MarkdownID,
    //     data: { name: file.Name, size: file.Size, type: 'file' }
    //   });
    // }

    // for(const folder of this.folders){
    //   directoryObject.push({
    //     key: folder.FolderID,
    //     data: { name: folder.FolderName, size: 0, type: 'folder' }
    //   });
    // }
    // return directoryObject;

    const rootFiles = this.getRootFiles();
    const rootFolders = this.getRootFolders();



    for (let folder of rootFolders) {
      directoryObject.push(this.getTreeTableNodesDataHelper(folder, 1));
    }

    for (let file of rootFiles) {
      directoryObject.push({
        key: file.MarkdownID,
        icon: this.fileIcon,
        data: {
          name: this.shortenName(file.Name),
          size: this.getSize(file.Size),
          type: 'file',
          key: file.MarkdownID,
        },
      });
    }

    return directoryObject;
  }

  private getTreeTableNodesDataHelper(folder: any, depth: number): any {
    let files = this.findAllChildrenFiles(folder.FolderID);
    let folders = this.findAllChildrenFolders(folder.FolderID);
    if (folders.length + files.length === 0) {
      return {
        key: folder.FolderID,
        icon: this.folderIcon,
        data: {
          name: this.shortenName(folder.FolderName),
          size: '-',
          type: 'folder',
          key: folder.FolderID,
        },
      };
    } else {
      let folderObject = {
        key: folder.FolderID,
        icon: this.folderIcon,
        data: {
          name: this.shortenName(folder.FolderName),
          size: '-',
          type: 'folder',
          key: folder.FolderID,
        },
        children: [{}],
      };

      let x = 0;
      folderObject.children.pop();
      
      for (let folder of folders) {
        folderObject.children.push(
          this.getTreeTableNodesDataHelper(folder, depth + 1)
        );
      }

      for (let file of files) {
        folderObject.children.push({
          key: file.MarkdownID,
          icon: this.fileIcon,
          data: {
            name: this.shortenName(file.Name),
            size: this.getSize(file.Size),
            type: 'file',
            key: file.MarkdownID,
          },
        });
      }



      return folderObject;
    }
  }

  private getSize(size: number) {
    if (size > 1000000000) {
      return (size / 1000000000).toFixed(2) + ' GB';
    } else if (size > 1000000) {
      return (size / 1000000).toFixed(2) + ' MB';
    }
    else if (size > 1000) {
      return (size / 1000).toFixed(2) + ' KB';
    }
    else {
      return size + ' B';
    }
  }

  public findAllChildrenFiles(parentID: string | undefined) {
    let children: any[] = [];
    for (let file of this.files) {
      if (file.ParentFolderID === parentID) {
        children.push(file);
      }
    }
    return children;
  }

  public findAllChildrenFolders(parentID: string | undefined) {
    let children: any[] = [];
    for (let folder of this.folders) {
      if (folder.ParentFolderID === parentID) {
        children.push(folder);
      }
    }
    return children;
  }

  private shortenName(name: string) {
    let newName = name;
    if (name.length > 10) {
      newName = name.substring(0, 10) + '...';
    }
    return newName;
  }
  private getRootFiles() {
    let rootFiles: any[] = [];
    for (let file of this.files) {
      if (file.ParentFolderID === '' || file.ParentFolderID === 'undefined/undefined') {
        rootFiles.push(file);
      }
    }
    return rootFiles;
  }

  private getRootFolders() {
    let rootFolders: any[] = [];
    for (let folder of this.folders) {
      if (folder.ParentFolderID === ''||folder.ParentFolderID==='undefined/undefined') {
        rootFolders.push(folder);
      }
    }
    return rootFolders;
  }

  async getFilesAndFolders() {
    this.setFolders(await this.folderService.retrieveAllFolders());
    this.setFiles(await this.fileService.retrieveAllFiles());
  }

  getFiles(): MarkdownFileDTO[] {
    return this.files;
  }

  setFiles(files: MarkdownFileDTO[]) {
    this.files = files;
  }

  getFolders(): FolderDTO[] {
    return this.folders;
  }

  setFolders(folders: FolderDTO[]) {
    this.folders = folders;
  }

  async getTreeTableNodes() {
    return Promise.resolve(await this.getTreeTableNodesData());
  }

  getFileDTOByID(MarkdownID: string | undefined | null): MarkdownFileDTO {
    for (let file of this.files) {
      if (file.MarkdownID === MarkdownID) {
        return file;
      }
    }
    return new MarkdownFileDTO();
  }

  getFolderDTOByID(FolderID: string | undefined | null): FolderDTO {
    for (let folder of this.folders) {
      if (folder.FolderID === FolderID) {
        return folder;
      }
    }
    return new FolderDTO();
  }

  checkType(KeyID: string | undefined | null): string {
    for (let file of this.files) {
      if (file.MarkdownID === KeyID) {
        return 'file';
      }
    }
    for (let folder of this.folders) {
      if (folder.FolderID === KeyID) {
        return 'folder';
      }
    }
    return '';
  }

  addFile(file: MarkdownFileDTO) {
    this.files.push(file);
  }

  addFolder(folder: FolderDTO) {
    this.folders.push(folder);
  }

  removeFile(markdownID: string | undefined) {
    // this.files.splice(this.files.indexOf(file), 1);
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].MarkdownID === markdownID) {
        this.files.splice(i, 1);
      }
    }
  }

  removeFolder(folderID: string | undefined) {
    // this.folders.splice(this.folders.indexOf(folder), 1);
    for (let i = 0; i < this.folders.length; i++) {
      if (this.folders[i].FolderID === folderID) {
        this.folders.splice(i, 1);
      }
    }
  }

  getParentFolderByID(ID: string | undefined | null): FolderDTO {
    for (let folder of this.folders) {
      if (folder.FolderID === ID) {
        return folder;
      }
    }
    for (let file of this.files) {
      if (file.MarkdownID === ID) {
        return this.getFolderDTOByID(file.ParentFolderID);
      }
    }
    return new FolderDTO();
  }

  getUniqueName(name: string, path: string | undefined, type: string): string {
    let newName = name;
    let i = 1;
    if (type === 'folder') {
      while (this.checkIfFolderExists(newName, path)) {
        newName = name + ' (' + i + ')';
        i++;
      }
    } else {
      while (this.checkIfFileExists(newName, path)) {
        newName = name + ' (' + i + ')';
        i++;
      }
    }
    return newName;
  }

  checkIfChildFolder(destinationDirectory: FolderDTO, movingDirectory: FolderDTO): boolean {
    if (destinationDirectory.ParentFolderID === '') return false;
    let parentFolder = this.getFolderDTOByID(destinationDirectory.ParentFolderID);
    while (parentFolder.FolderID !== movingDirectory.FolderID) {
      if (!parentFolder.FolderID) {
        return false;
      }
      parentFolder = this.getFolderDTOByID(parentFolder.ParentFolderID);
    }

    return true;
  }

  private checkIfFolderExists(name: string, path: string | undefined): boolean {
    for (let folder of this.folders) {
      if (folder.FolderName === name && folder.Path === path) {
        return true;
      }
    }
    return false;
  }

  private checkIfFileExists(name: string, path: string | undefined): boolean {
    for (let file of this.files) {
      if (file.Name === name && file.Path === path) {
        return true;
      }
    }
    return false;
  }

  public getFoldersByParentID(parentID: string | undefined): FolderDTO[] {
    let folders: FolderDTO[] = [];
    for (let folder of this.folders) {
      if (folder.ParentFolderID === parentID) {
        folders.push(folder);
      }
    }
    return folders;
  }

  public getFilesByParentID(parentID: string | undefined): MarkdownFileDTO[] {
    let files: MarkdownFileDTO[] = [];
    for (let file of this.files) {
      if (file.ParentFolderID === parentID) {
        files.push(file);
      }
    }
    return files;
  }

  public renameFolder(folderID: string, newName: string) {
    for (let folder of this.folders) {
      if (folder.FolderID === folderID) {
        folder.FolderName = newName;
      }
    }
  }

  public renameFile(fileID: string, newName: string) {
    for (let file of this.files) {
      if (file.MarkdownID === fileID) {
        file.Name = newName;
      }
    }
  }


}
