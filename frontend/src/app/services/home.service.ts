import { Injectable } from '@angular/core';
import { TreeNode } from "primeng/api";
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
export class MenuService {
  //This is probably does not have to be a service, will ask the rest.
  getMenuItemsData() {
    return [
      {
        label: 'File',
        icon: 'pi pi-fw pi-file',
        items: [
          {
            label: 'New',
            icon: 'pi pi-fw pi-plus',
            items: [
              {
                label: 'Bookmark',
                icon: 'pi pi-fw pi-bookmark'
              },
              {
                label: 'Video',
                icon: 'pi pi-fw pi-video'
              }
            ]
          },
          {
            label: 'Delete',
            icon: 'pi pi-fw pi-trash'
          },
          {
            separator: true
          },
          {
            label: 'Export',
            icon: 'pi pi-fw pi-external-link'
          }
        ]
      },
      {
        label: 'Edit',
        icon: 'pi pi-fw pi-pencil',
        items: [
          {
            label: 'Left',
            icon: 'pi pi-fw pi-align-left'
          },
          {
            label: 'Right',
            icon: 'pi pi-fw pi-align-right'
          },
          {
            label: 'Center',
            icon: 'pi pi-fw pi-align-center'
          },
          {
            label: 'Justify',
            icon: 'pi pi-fw pi-align-justify'
          }
        ]
      },
      {
        label: 'Users',
        icon: 'pi pi-fw pi-user',
        items: [
          {
            label: 'New',
            icon: 'pi pi-fw pi-user-plus'
          },
          {
            label: 'Delete',
            icon: 'pi pi-fw pi-user-minus'
          },
          {
            label: 'Search',
            icon: 'pi pi-fw pi-users',
            items: [
              {
                label: 'Filter',
                icon: 'pi pi-fw pi-filter',
                items: [
                  {
                    label: 'Print',
                    icon: 'pi pi-fw pi-print'
                  }
                ]
              },
              {
                icon: 'pi pi-fw pi-bars',
                label: 'List'
              }
            ]
          }
        ]
      },
      {
        label: 'Events',
        icon: 'pi pi-fw pi-calendar',
        items: [
          {
            label: 'Edit',
            icon: 'pi pi-fw pi-pencil',
            items: [
              {
                label: 'Save',
                icon: 'pi pi-fw pi-calendar-plus'
              },
              {
                label: 'Delete',
                icon: 'pi pi-fw pi-calendar-minus'
              }
            ]
          },
          {
            label: 'Archieve',
            icon: 'pi pi-fw pi-calendar-times',
            items: [
              {
                label: 'Remove',
                icon: 'pi pi-fw pi-calendar-minus'
              }
            ]
          }
        ]
      },
      {
        label: 'Quit',
        icon: 'pi pi-fw pi-power-off'
      }
    ];
  }
}
@Injectable()
export class NodeService {

  constructor(private userService: UserService, private http: HttpClient, private fileService: FileService, private folderService: FolderService) { }

  private files: MarkdownFileDTO[] = [];
  private folders: FolderDTO[] = [];

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
      type: 'Folder'
    },
    children: [
      { //contains other folders/files
      }
    ], //The above 3 attributes are required for the TreeTable to work. The below is the data related to the folder
    FolderID: '0', //FolderID from the database
    DateCreated: '2023-06-24', //DateCreated from the database
    LastModified: '2023-06-24', //DateModified from the database
    ParentFolderID: '0', //ParentID from the database
    Path: 'C:/Users/...', //Path from the database
  }

  //What each file object will look like:
  typicalFile = {
    key: '0', //some unique identifier
    data: {
      name: 'fileName',
      size: '100kb',
      type: 'File'
    }, //The above 2 attributes are required for the TreeTable to work. The below is the data related to the file
    FileID: '0', //FileID from the database
    DateCreated: '2023-06-24', //DateCreated from the database
    LastModified: '2023-06-24', //DateModified from the database
    ParentFolderID: '0', //ParentID from the database
    Path: 'C:/Users/...', //Path from the database
    Content: 'This is the content of the file' //Content from the database
  }


  getTreeTableNodesData(): any {
    
    [
      {
        key: '0',
        data: {
          name: 'Applications',
          size: '100kb',
          type: 'Folder'
        },
        children: [
          {
            key: '0-0',
            data: {
              name: 'React',
              size: '25kb',
              type: 'Folder'
            },
            children: [
              {
                key: '0-0-0',
                data: {
                  name: 'react.app',
                  size: '10kb',
                  type: 'Application'
                }
              },
              {
                key: '0-0-1',
                data: {
                  name: 'native.app',
                  size: '10kb',
                  type: 'Application'
                }
              },
              {
                key: '0-0-2',
                data: {
                  name: 'mobile.app',
                  size: '5kb',
                  type: 'Application'
                }
              }
            ]
          },
          {
            key: '0-1',
            data: {
              name: 'editor.app',
              size: '25kb',
              type: 'Application'
            }
          },
          {
            key: '0-2',
            data: {
              name: 'settings.app',
              size: '50kb',
              type: 'Application'
            }
          }
        ]
      },
      {
        key: '1',
        data: {
          name: 'Cloud',
          size: '20kb',
          type: 'Folder'
        },
        children: [
          {
            key: '1-0',
            data: {
              name: 'backup-1.zip',
              size: '10kb',
              type: 'Zip'
            }
          },
          {
            key: '1-1',
            data: {
              name: 'backup-2.zip',
              size: '10kb',
              type: 'Zip'
            }
          }
        ]
      },
      {
        key: '2',
        data: {
          name: 'Desktop',
          size: '150kb',
          type: 'Folder'
        },
        children: [
          {
            key: '2-0',
            data: {
              name: 'note-meeting.txt',
              size: '50kb',
              type: 'Text'
            }
          },
          {
            key: '2-1',
            data: {
              name: 'note-todo.txt',
              size: '100kb',
              type: 'Text'
            }
          }
        ]
      },
      {
        key: '3',
        data: {
          name: 'Documents',
          size: '75kb',
          type: 'Folder'
        },
        children: [
          {
            key: '3-0',
            data: {
              name: 'Work',
              size: '55kb',
              type: 'Folder'
            },
            children: [
              {
                key: '3-0-0',
                data: {
                  name: 'Expenses.doc',
                  size: '30kb',
                  type: 'Document'
                }
              },
              {
                key: '3-0-1',
                data: {
                  name: 'Resume.doc',
                  size: '25kb',
                  type: 'Resume'
                }
              }
            ]
          },
          {
            key: '3-1',
            data: {
              name: 'Home',
              size: '20kb',
              type: 'Folder'
            },
            children: [
              {
                key: '3-1-0',
                data: {
                  name: 'Invoices',
                  size: '20kb',
                  type: 'Text'
                }
              }
            ]
          }
        ]
      },
      {
        key: '4',
        data: {
          name: 'Downloads',
          size: '25kb',
          type: 'Folder'
        },
        children: [
          {
            key: '4-0',
            data: {
              name: 'Spanish',
              size: '10kb',
              type: 'Folder'
            },
            children: [
              {
                key: '4-0-0',
                data: {
                  name: 'tutorial-a1.txt',
                  size: '5kb',
                  type: 'Text'
                }
              },
              {
                key: '4-0-1',
                data: {
                  name: 'tutorial-a2.txt',
                  size: '5kb',
                  type: 'Text'
                }
              }
            ]
          },
          {
            key: '4-1',
            data: {
              name: 'Travel',
              size: '15kb',
              type: 'Text'
            },
            children: [
              {
                key: '4-1-0',
                data: {
                  name: 'Hotel.pdf',
                  size: '10kb',
                  type: 'PDF'
                }
              },
              {
                key: '4-1-1',
                data: {
                  name: 'Flight.pdf',
                  size: '5kb',
                  type: 'PDF'
                }
              }
            ]
          }
        ]
      },
      {
        key: '5',
        data: {
          name: 'Main',
          size: '50kb',
          type: 'Folder'
        },
        children: [
          {
            key: '5-0',
            data: {
              name: 'bin',
              size: '50kb',
              type: 'Link'
            }
          },
          {
            key: '5-1',
            data: {
              name: 'etc',
              size: '100kb',
              type: 'Link'
            }
          },
          {
            key: '5-2',
            data: {
              name: 'var',
              size: '100kb',
              type: 'Link'
            }
          }
        ]
      },
      {
        key: '6',
        data: {
          name: 'Other',
          size: '5kb',
          type: 'Folder'
        },
        children: [
          {
            key: '6-0',
            data: {
              name: 'todo.txt',
              size: '3kb',
              type: 'Text'
            }
          },
          {
            key: '6-1',
            data: {
              name: 'logo.png',
              size: '2kb',
              type: 'Picture'
            }
          }
        ]
      },
      {
        key: '7',
        data: {
          name: 'Pictures',
          size: '150kb',
          type: 'Folder'
        },
        children: [
          {
            key: '7-0',
            data: {
              name: 'barcelona.jpg',
              size: '90kb',
              type: 'Picture'
            }
          },
          {
            key: '7-1',
            data: {
              name: 'primeng.png',
              size: '30kb',
              type: 'Picture'
            }
          },
          {
            key: '7-2',
            data: {
              name: 'prime.jpg',
              size: '30kb',
              type: 'Picture'
            }
          }
        ]
      },
      {
        key: '8',
        data: {
          name: 'Videos',
          size: '1500kb',
          type: 'Folder'
        },
        children: [
          {
            key: '8-0',
            data: {
              name: 'primefaces.mkv',
              size: '1000kb',
              type: 'Video'
            }
          },
          {
            key: '8-1',
            data: {
              name: 'intro.avi',
              size: '500kb',
              type: 'Video'
            }
          }
        ]
      }
    ];


  //  return this.fileService.retrieveAllFiles().then(nodes => {
  //     this.setFiles(nodes);

  //     let directoryObject: {
  //       RootChildren: {
  //         key: string | undefined,
  //         data: { name: string | undefined, size: number | undefined, type: string | undefined },
  //       }[]
  //     } = { RootChildren: [] };
  //     for (let file of this.files) {
  //       directoryObject.RootChildren.push({
  //         key: file.MarkdownID,
  //         data: { name: file.Name, size: file.Size, type: 'file' }
  //       });
  //     }
  //     console.log(directoryObject.RootChildren);
  //     return Promise.resolve(directoryObject.RootChildren);
  //   });

    let directoryObject: {
      RootChildren: {
        key: string | undefined,
        data: { name: string | undefined, size: number | undefined, type: string | undefined },
        children?: {}[]
      }[]
    } = { RootChildren: [] };

    for (let folder of this.folders) {
      directoryObject.RootChildren.push({
        key: folder.FolderID,
        data: { name: folder.FolderName, size: 0, type: 'folder' },
        children: [{ key: '0', data: { name: 'DUMMY DATA', size: 0, type: 'file' }}]
      });
    }

    for (let file of this.files) {
      directoryObject.RootChildren.push({
        key: file.MarkdownID,
        data: { name: file.Name, size: file.Size, type: 'file' }
      });
    }


    return directoryObject.RootChildren;
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

  getFileDTOByID(MarkdownID: string): MarkdownFileDTO {
    for (let file of this.files) {
      if (file.MarkdownID === MarkdownID) {
        return file;
      }
    }
    return new MarkdownFileDTO();
  }

  addFile(file: MarkdownFileDTO) {
    this.files.push(file);
  }

  addFolder(folder: FolderDTO) {
    this.folders.push(folder);
  }

  removeFile(file: MarkdownFileDTO) {
    this.files.splice(this.files.indexOf(file), 1);
  }

  removeFolder(folder: FolderDTO) {
    this.folders.splice(this.folders.indexOf(folder), 1);
  }
};
