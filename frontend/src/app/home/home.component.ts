import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  HostListener,
  NgZone,
  ViewChild,
  Inject
} from '@angular/core';
// import {NgModule} from "@angular/core";
import { Router } from '@angular/router';
import { TreeTable } from 'primeng/treetable';

import {
  MenuItem,
  MessageService,
  TreeNode,
  ConfirmationService,
  ConfirmEventType,
} from 'primeng/api';
import { NodeService } from '../services/home.service';
import { DialogService } from 'primeng/dynamicdialog';
import { FileService } from '../services/file.service';
import { UserService } from '../services/user.service';
import { FileUploadPopupComponent } from '../file-upload-popup/file-upload-popup.component';
import { EditService } from '../services/edit.service';
import { FolderService } from '../services/folder.service';
import { CoordinateService } from '../services/coordinate.service';
import { ImageUploadPopupComponent } from '../image-upload-popup/image-upload-popup.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ContextMenu } from 'primeng/contextmenu';
import { set } from 'cypress/types/lodash';

interface Column {
  field: string;
  header: string;
}

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  public filesDirectoryTree!: TreeNode[];
  public filesDirectoryTreeTable!: TreeNode[];
  public filteredFilesDirectoryTreeTable!: TreeNode[];
  public activeDirectoryItems!: MenuItem[];
  public directoryHome!: MenuItem;
  public menuBarItems!: MenuItem[];
  public speedDialItems!: MenuItem[];
  public treeTableColumns!: Column[];

  public currentDirectory!: any;

  //variables for dynamic resizing
  componentWidth: string = '';
  menubarElement: HTMLElement | null = null;
  subMenu: HTMLElement | null = null;

  //variables for double click and enter key to open doc
  public previousNode!: any;
  public currentNode!: any;

  //variables for drag and drop
  public originalPosition: { x: number; y: number } | null = null;
  public currentlyDraggedNode!: any;
  public isDraggingNode = false;

  public treeSelectedFile!: any;
  public directoryData!: any;
  public recentToggle: boolean = false;
  public selectToggle: boolean = false;
  public expandToggle: boolean = false;
  public rootToggle: boolean = false;
  public editToggle: boolean = false;
  public valueBeforeEdit: string = '';
  public colInspect: any;

  public moveDialogVisible: boolean = false;
  public entityToMove: any;
  public destinationDirectory: any;
  public createNewDocumentDialogVisible: boolean = false;
  public createNewFolderDialogVisible: boolean = false;
  renameDialogVisible: boolean = false;
  documentLockedPopup: boolean = false;
  openLockedDocumentPopup: boolean = false;
  sharePopup: boolean = false;
  removeDocumentLock: boolean = false;

  public entityName: string = '';
  entityRename: string = '';
  uploadedFiles: any[] = [];
  contextMenuItems: any[];
  public userDocumentPassword: string = '';
  recipientEmail: string = '';
  documentPromise: Promise<any> | null = null;

  currentFolders: any[] = []; //Holds an array of objects representing folders.
  currentFiles: any[] = []; //Holds an array of objects representing files.
  folderIDHistory: string[] = [];
  folderIDHistoryPosition: number = 0;

  shiftClickStart: any = null;
  rootFolder: any = {};
  public loading: boolean = false;
  @ViewChild('myTreeTable') treeTable!: TreeTable;
  @ViewChild(ContextMenu) contextMenu!: ContextMenu;
  contextMenuVisible: boolean = false;

  constructor(
    @Inject(Router) private router: Router,
    private nodeService: NodeService,
    private elementRef: ElementRef,
    private messageService: MessageService,
    private dialogService: DialogService,
    private loadingSpinnerService: NgxSpinnerService,
    private fileService: FileService,
    private userService: UserService,
    private editService: EditService,
    private folderService: FolderService,
    private renderer: Renderer2,
    private coordinateService: CoordinateService,
    private confirmationService: ConfirmationService,
    private zone: NgZone
  ) {
    this.contextMenuItems = [
      {
        label: 'Open',
        icon: 'pi pi-fw pi-folder-open',
        command: () => {
          const selected = this.getSelected();

          if (selected.length === 1) {
            if (selected[0].Type == 'folder') {
              this.openFolder(selected[0].FolderID);
            } else if (selected[0].Type == 'file') {
              this.onOpenFileSelect(selected[0].MarkdownID);
            }
          }
        }
      },
      {
        label: 'Create New Folder',
        icon: 'pi pi-folder',
        command: () => (this.createNewFolderDialogVisible = true),
      },
      {
        label: 'Create New Document',
        icon: 'pi pi-file',
        command: () => (this.createNewDocumentDialogVisible = true),
      },
      {
        label: 'Move',
        icon: 'pi pi-fw pi-arrow-right',
        command: () => this.startMove(),
      },
      // {
      //   label: 'Enclose in Folder',
      //   icon: 'pi pi-folder-plus',
      //   // command: () => this.encloseSelectionInFolder()
      // },
      {
        label: 'Rename',
        icon: 'pi pi-pencil',
        command: () => {
          const selected = this.getSelected();
          if (selected.length === 1) {
            if (!(this.entityRename = this.getSelected()[0].Name))
              this.entityRename = this.getSelected()[0].FolderName;
            this.renameDialogVisible = true;
          }
        },
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.deleteSelectedEntities(),
      },
      {
        label: 'Lock Document',
        icon: 'pi pi-lock',
        command: () => {
          this.documentLockedPopup = true;

          const file = this.getSelected();
          if (file.length === 1) {
            this.documentPromise = this.fileService
              .retrieveDocument(file[0].MarkdownID, file[0].Path);
          }
        },
      },
      {
        label: 'Share',
        icon: 'pi pi-share-alt',
        command: () => {
          this.sharePopup = true;
        },
      },
    ];
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    this.updateMenubarWidth(); // Call the function when the window is resized
  }

  updateMenubarWidth() {
    if (!this.menubarElement) return; // Ensure that the menubar element is available

    const viewportWidth = window.innerWidth;

    if (viewportWidth >= 960) {
      this.componentWidth = '400px';
    } else {
      this.componentWidth = '190px';
    }

    // Update the style of the menubar element with the calculated width
    this.menubarElement.style.minWidth = this.componentWidth;
  }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }

  // These functions serve to add intelligent routing and usage for directory management

  reloadMainFromRoot(): void {
    this.filterTable('', 3);
  }

  // The functions below serve to allow for editing and all other processes involved with editing
  // file names.
  onRowLabelEdit(event: any, rowNode: any): void {
    if (event !== this.valueBeforeEdit) {
      this.updateTreeNodeLabel(
        this.filesDirectoryTree,
        rowNode.node.key,
        event
      );
      this.updateTreeTableData(
        this.filteredFilesDirectoryTreeTable,
        rowNode.node.key,
        event
      );
      this.updateTreeTableData(
        this.filesDirectoryTreeTable,
        rowNode.node.key,
        event
      );
      this.sendEditedRowLabel(event, rowNode.node.key, rowNode.node.data.type);
    }
  }

  updateTreeTableData(
    nodes: TreeNode[],
    key: string,
    newValue: string
  ): boolean {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.key === key) {
        node.data.name = newValue;
        return true;
      }
      if (node.children && node.children.length > 0) {
        const found = this.updateTreeTableData(node.children, key, newValue);
        if (found) {
          return true;
        }
      }
    }
    return false;
  }

  updateTreeNodeLabel(
    nodes: TreeNode[],
    key: string,
    newValue: string
  ): boolean {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.key === key) {
        node.label = newValue;
        return true;
      }
      if (node.children && node.children.length > 0) {
        const found = this.updateTreeNodeLabel(node.children, key, newValue);
        if (found) {
          return true;
        }
      }
    }
    return false;
  }

  //TODO Implement breadcrumb
  updateBreadcrumb(selectedNode: TreeNode | undefined) {
    // Clear the existing breadcrumb items
    this.activeDirectoryItems = [];
    // Traverse the selected node's ancestors to generate the breadcrumb items
    let currentNode = selectedNode;
    while (currentNode) {
      this.activeDirectoryItems.unshift({ label: currentNode.label });
      currentNode = currentNode.parent;
    }
    return false;
  }

  sendEditedRowLabel(event: any, key: string, type: string): void {
    if (type === 'folder') {
      const folder = this.nodeService.getFolderDTOByID(key);
      this.folderService
        .renameFolder(folder.FolderID, folder.Path, event)
        .then((data) => { });
    } else {
      const file = this.nodeService.getFileDTOByID(key);
      this.fileService
        .renameDocument(file.MarkdownID, event, file.Path)
        .then((data) => { });
    }
  }

  // End of functions that implement editing functionality.
  generateTreeNodes(data: any[]): TreeNode[] {
    return data.map((item) => {
      const node: TreeNode = {
        key: item.key,
        label: item.data.name,
        data: item.data,
        icon: item.icon,
        children: this.generateTreeNodes(item.children || []),
      };
      return node;
    });
  }

  async ngOnInit() {
    this.loading = true;
    // Get a reference to the menubar element with the specific class
    this.menubarElement = this.elementRef.nativeElement.querySelector(
      '.p-menubar.custom-menubar'
    );

    // Call the function to set the component width initially
    this.updateMenubarWidth();
    // Below is the function that initially populates the fileTree

    await this.nodeService.getFilesAndFolders().then(() => {

      const hist = localStorage.getItem('folderIDHistory');
      const pos = localStorage.getItem('folderIDHistoryPosition');

      if (hist != null && pos != null) {
        this.folderIDHistory = JSON.parse(hist);
        this.folderIDHistoryPosition = JSON.parse(pos);
        this.loadByParentID(this.folderIDHistory[this.folderIDHistoryPosition]);
      } else {
        this.folderIDHistory.push('');
        this.loadByParentID('');
      }

      const data = this.nodeService.getTreeTableNodesData();
      console.log(data);
      this.filesDirectoryTree = this.generateTreeNodes(data);

      // Below is the function that populates the treeTable
      // Note, both filtered and non-filtered needs to be made and kept up to date,
      // as the non-filtered serves as the filter for the filters for the logic in the filter function
      // below
      this.nodeService.getTreeTableNodes().then((data) => {
        this.filesDirectoryTreeTable = data;
        this.filteredFilesDirectoryTreeTable = data;
      });
      this.treeTableColumns = [
        { field: 'name', header: 'Name' },
        { field: 'size', header: 'Size' },
        { field: 'type', header: 'Type' },
      ];
    });
    //Below is the code that populates the directoryPath
    // this.activeDirectoryItems = [{ label: 'Computer' }, { label: 'Notebook' }, { label: 'Accessories' }, { label: 'Backpacks' }, { label: 'Item' }];
    this.directoryHome = { icon: 'pi pi-home', routerLink: '/' };
    //Below is the code that populates the menu items, can be done intelligently with regards to current selection
    //in main window.
    document.getElementsByClassName('menubar');
    this.menuBarItems = this.getMenuItemsData();
    //Below is the code that populates the directories accordingly via the helper function, load directory
    //Below is the code for the speed dial menu
    //Can be done intelligently with that which is in focus in the main window
    this.speedDialItems = [
      {
        icon: 'pi pi-pencil',
        command: async () => {
          this.createNewDocumentDialogVisible = true;
        },
      },
      {
        icon: 'pi pi-refresh',
        command: () => {
          // this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Data Updated' });
        },
      },
      {
        icon: 'pi pi-trash',
        command: () => {
          // this.messageService.add({ severity: 'error', summary: 'Delete', detail: 'Data Deleted' });
        },
      },
      {
        icon: 'pi pi-upload',
        command: () => {
          this.showFileUploadPopup();
        },
      },
      {
        icon: 'pi pi-external-link',
      },
    ];
    // Below are the functions that implement intelligent routing of the directory tree on the left side of the home page
    // it routes the relevant directory to the main window

    this.rootFolder.FolderID = '';
    this.rootFolder.FolderName = 'Root';
    this.rootFolder.Path = '';
    this.rootFolder.Selected = false;
    this.rootFolder.MoveSelected = false;
    this.rootFolder.Type = 'folder';

    this.loading = false;
  }

  iterateNodeIDRemoval(node: any[]) {
    if (!node) {
      return node;
    }
    for (let i = 0; i < node.length; i++) {
      this.removeUniqueIDRecursive(node[i]);
    }
    return node;
  }

  removeUniqueIDRecursive(node: any) {
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        this.removeUniqueIDRecursive(node.children[i]);
      }
    }
  }

  onNodeSelect(event: any): void {
    //Open folder on click
    if (event.node.data.type === 'folder') {
      this.openFolder(event.node.key);
    }
    //Open file's folder on click
    else if (event.node.data.type === 'file') {
      if (!event.node.parent) {
        this.openFolder('');
      } else this.openFolder(event.node.parent.key);

      this.unselectAll();
      for (let i = 0; i < this.currentFiles.length; i++) {
        if (this.currentFiles[i].MarkdownID == event.node.key) {
          this.currentFiles[i].Selected = true;
        }
      }
    }
  }

  // end of functions implementing routing of directory tree to the main window

  // below the code that Filter's the table, which is also called when the tree nodes are expanded
  // or collapsed.
  toggleAllNodes(nodes: TreeNode[], collapseOrExpand: boolean): void {
    nodes.forEach((node) => {
      node.expanded = collapseOrExpand;
      if (node.children && node.children.length > 0) {
        this.toggleAllNodes(node.children, collapseOrExpand);
      }
    });
    this.treeTable.isEmpty();
  }

  //TODO filter events from click on the left side directory contents need to rather use
  // a filter that finds the relevant directories via keys, not the actual text of the
  // file's name.
  filterTable(filterEvent: any, searchCollapseExpandRoot: number) {
    let filterValue = '';
    let explodeOrCollapse: boolean = true;
    if (1 == searchCollapseExpandRoot) {
      explodeOrCollapse = false;
      const collapsedNode = filterEvent.node;
      const parent = collapsedNode.parent as TreeNode;
      if (parent == undefined) {
        filterValue = '';
      } else if (parent.label != null) {
        filterValue = parent.label;
      }
    }
    if (2 == searchCollapseExpandRoot) {
      explodeOrCollapse = true;
      filterValue = filterEvent.node.label;
    }
    if (0 == searchCollapseExpandRoot) {
      explodeOrCollapse = false;
      filterValue = filterEvent.target.value;
    }
    if (3 == searchCollapseExpandRoot) {
      filterValue = filterEvent;
      explodeOrCollapse = false;
    }
    // Perform filtering based on the first column
    this.filteredFilesDirectoryTreeTable = this.filesDirectoryTreeTable.filter(
      (node) => {
        const name = node.data[this.treeTableColumns[0].field] as string;
        const hasMatchingChild = this.hasMatchingChildNode(node, filterValue);
        return (
          name.toLowerCase().includes(filterValue.toLowerCase()) ||
          hasMatchingChild
        );
      }
    );
    // Perform explosion of all those nodes.
    this.toggleAllNodes(
      this.filteredFilesDirectoryTreeTable,
      explodeOrCollapse
    );
  }

  // a helper function for filterTable that searches for child nodes inside the treeTable
  // that may be included into a parent node
  // this prevents searching in only the first node layer.
  hasMatchingChildNode(node: TreeNode, filterValue: string): boolean {
    if (node.children) {
      for (const child of node.children) {
        const name = child.data[this.treeTableColumns[0].field] as string;
        if (name.toLowerCase().includes(filterValue.toLowerCase())) {
          return true;
        }
        const hasMatchingChild = this.hasMatchingChildNode(child, filterValue);
        if (hasMatchingChild) {
          return true;
        }
      }
    }
    return false;
  }


  showFileUploadPopup(): void {
    const ref = this.dialogService.open(FileUploadPopupComponent, {
      header: 'Upload Files',
      showHeader: true,
      closable: true,
      closeOnEscape: true,
      dismissableMask: true,
    });
    // Subscribe to dialog close event if needed
    ref.onClose.subscribe(() => {
      // Handle any actions after the dialog is closed
    });
  }
  showImageUploadPopup(): void {
    const ref = this.dialogService.open(ImageUploadPopupComponent, {
      header: 'Upload Images',
      showHeader: true,
      closable: true,
      closeOnEscape: true,
      dismissableMask: true,
    });
  }

  // this code updates the background layer to not be adjusted from the edit page after navigation.
  ngAfterViewInit() {
    this.subMenu = this.elementRef.nativeElement.querySelector('.p-menubarsub');
    if (this.subMenu) {
      this.subMenu.style.zIndex = '10000 !important';
    }
    this.updateMenubarWidth();
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#FFFFFF';
    this.elementRef.nativeElement.ownerDocument.body.style.margin = '0';
    this.elementRef.nativeElement.ownerDocument.body.style.height = '100svh';
  }

  onOpenFileSelect(MarkdownID: string | undefined | null): void {
    const file = this.nodeService.getFileDTOByID(MarkdownID);
    if (file.SafeLock) {
      this.openLockedDocumentPopup = true;
      this.documentPromise = this.fileService.retrieveDocument(file.MarkdownID, file.Path);
      return;
    }
    this.loading = true;
    this.fileService
      .retrieveDocument(file.MarkdownID, file.Path)
      .then((data) => {
        this.editService.setAll(
          data,
          file.MarkdownID,
          file.Name,
          file.Path,
          file.ParentFolderID,
          file.SafeLock,
          ''
        );

        this.loading = false;
        if (!file.SafeLock)
          this.navigateToPage('edit');
      });

  }


  delete(event: any) {
    if (event.Type == 'folder') {
      this.deleteAllChildren(this.nodeService.getFolderDTOByID(event.FolderID));

      this.refreshTree();
      this.currentDirectory = null;
    } else {
      this.fileService.deleteDocument(event.MarkdownID);
      this.deleteEntryByKey(this.filesDirectoryTree, event.MarkdownID);
      this.deleteEntryByKey(this.filesDirectoryTreeTable, event.MarkdownID);
      this.deleteEntryByKey(
        this.filteredFilesDirectoryTreeTable,
        event.MarkdownID
      );
      this.nodeService.removeFile(event.MarkdownID);
      this.refreshTree();
      this.currentDirectory = null;
    }
  }

  deleteAllChildren(event: any) {
    const files = this.nodeService.findAllChildrenFiles(event.FolderID);
    const folders = this.nodeService.findAllChildrenFolders(event.FolderID);
    for (const file of files) {
      this.fileService.deleteDocument(file.MarkdownID);
      this.deleteEntryByKey(this.filesDirectoryTree, file.MarkdownID);
      this.deleteEntryByKey(this.filesDirectoryTreeTable, file.MarkdownID);
      this.deleteEntryByKey(
        this.filteredFilesDirectoryTreeTable,
        file.MarkdownID
      );
      this.nodeService.removeFile(file.MarkdownID);
    }
    for (const folder of folders) {
      this.deleteAllChildren(folder);
      this.folderService.deleteFolder(folder.FolderID);
      this.deleteEntryByKey(this.filesDirectoryTree, folder.FolderID);
      this.deleteEntryByKey(this.filesDirectoryTreeTable, folder.FolderID);
      this.deleteEntryByKey(
        this.filteredFilesDirectoryTreeTable,
        folder.FolderID
      );
      this.nodeService.removeFolder(folder.FolderID);
    }
    this.folderService.deleteFolder(event.FolderID);
    this.deleteEntryByKey(this.filesDirectoryTree, event.FolderID);
    this.deleteEntryByKey(this.filesDirectoryTreeTable, event.FolderID);
    this.deleteEntryByKey(this.filteredFilesDirectoryTreeTable, event.FolderID);
    this.nodeService.removeFolder(event.FolderID);
  }

  deleteEntryByKey(data: TreeNode[], keyToDelete: string): void {
    for (let i = 0; i < data.length; i++) {
      const currentNode = data[i];
      if (currentNode.key === keyToDelete) {
        data.splice(i, 1); // Remove the node at index i
        return; // Exit the function after deleting the entry
      }
      if (currentNode.children) {
        this.deleteEntryByKey(currentNode.children, keyToDelete); // Recursively check children nodes
      }
    }
  }

  getMenuItemsData() {
    if (window.matchMedia('(pointer: coarse)').matches)
      return [
        {
          label: 'New',
          icon: 'pi pi-fw pi-plus',
          items: [
            {
              label: 'Folder',
              icon: 'pi pi-fw pi-folder',
              command: () => {
                // this.showFileManagerPopup('folder');
                this.createNewFolderDialogVisible = true;
              },
            },
            {
              label: 'Document',
              icon: 'pi pi-fw pi-file',
              command: () => {
                // this.showFileManagerPopup('document');
                this.createNewDocumentDialogVisible = true;
              },
            },
          ],
        },
        {
          label: 'Import',
          icon: 'pi pi-fw pi-upload',
          items: [
            {
              label: 'Upload File',
              icon: 'pi pi-fw pi-file',
              command: () => {
                this.showFileUploadPopup();
              },
            },
            {
              label: 'Upload Asset',
              icon: 'pi pi-fw pi-image',
              command: () => {
                this.showImageUploadPopup();
              },
            },
          ],
        },
        {
          label: 'Logout',
          icon: 'pi pi-fw pi-power-off',
          command: () => {
            this.userService.logout();
          },
        },
      ]
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
                label: 'Folder',
                icon: 'pi pi-fw pi-folder',
                command: () => {
                  // this.showFileManagerPopup('folder');
                  this.createNewFolderDialogVisible = true;
                },
              },
              {
                label: 'Document',
                icon: 'pi pi-fw pi-file',
                command: () => {
                  // this.showFileManagerPopup('document');
                  this.createNewDocumentDialogVisible = true;
                },
              },
            ],
          },
          {
            label: 'Open',
            icon: 'pi pi-fw pi-folder',
            command: () => {
              const selected = this.getSelected();

              if (selected.length === 1) {
                if (selected[0].Type == 'folder') {
                  this.openFolder(selected[0].FolderID);
                } else if (selected[0].Type == 'file') {
                  this.onOpenFileSelect(selected[0].MarkdownID);
                }
              } else if (selected.length === 0) {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Please Select a Folder or File to Open',
                  detail: '',
                });
              }
            },
          },
          {
            label: 'Rename',
            icon: 'pi pi-fw pi-pencil',
            command: () => {
              if (this.getSelected().length === 1) {
                if (!(this.entityRename = this.getSelected()[0].Name))
                  this.entityRename = this.getSelected()[0].FolderName;
                this.renameDialogVisible = true;
              } else if (this.getSelected().length === 0) {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Please Select a Folder or File to Rename',
                  detail: '',
                });
              }
            },
          },
          {
            label: 'Move',
            icon: 'pi pi-fw pi-arrow-right',
            command: () => this.startMove(),
          },
          {
            label: 'Delete',
            icon: 'pi pi-fw pi-trash',
            command: () => {
              const selected = this.getSelected();
              if (selected.length > 0) {
                this.deleteSelectedEntities();
              } else {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Please select a Folder or File to Delete',
                  detail: '',
                });
              }
            },
          },
          {
            label: 'Share',
            icon: 'pi pi-fw pi-share-alt',
            command: () => {
              if (this.getSelected().length === 1 && this.getSelected()[0].Type === 'file')
                this.sharePopup = true;
              else
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Please select a File to Share',
                  detail: '',
                });
            },

          }
          // {//TODO implement downloading a file from the database
          //   label: 'Export',
          //   icon: 'pi pi-fw pi-external-link',
          //   command: () => {
          //
          //   }
          // }
        ],
      },
      {
        label: 'Import',
        icon: 'pi pi-fw pi-upload',
        items: [
          {
            label: 'Upload File',
            icon: 'pi pi-fw pi-file',
            command: () => {
              this.showFileUploadPopup();
            },
          },
          {
            label: 'Upload Asset',
            icon: 'pi pi-fw pi-image',
            command: () => {
              this.showImageUploadPopup();
            },
          },
          {
            label: 'Camera Upload',
            icon: 'pi pi-fw pi-camera',
            command: () => {
              this.navigateToPage('camera');
            },
          },
        ],
      },
      {
        label: 'Logout',
        icon: 'pi pi-fw pi-power-off',
        command: () => {
          this.userService.logout();
        },
      },
    ];
  }

  getUserFirstName(): string | undefined {
    return this.userService.getFirstName();
  }

  async createNewFolder() {
    this.createNewFolderDialogVisible = false;

    let path: string | undefined = '';
    let parentFolderID: string | undefined = '';
    if (this.entityName == '') {
      this.entityName = 'New Folder';
    }

    // if (this.currentDirectory != null) {
    //   if (this.currentDirectory.data.type === 'folder') {
    //     const folder = this.nodeService.getFolderDTOByID(
    //       this.currentDirectory.key
    //     );
    //     path = folder.Path;
    //     if (folder.Path !== '') path += `/${this.currentDirectory.data.name}`;
    //     else path += `${this.currentDirectory.data.name}`;
    //   } else {
    //     const file = this.nodeService.getFileDTOByID(this.currentDirectory.key);
    //     path = file.Path;
    //   }

    //   parentFolderID = this.currentDirectory.key;
    //   if (this.currentDirectory.data.type !== 'folder') {
    //     const file = this.nodeService.getFileDTOByID(this.currentDirectory.key);
    //     parentFolderID = file.ParentFolderID;
    //   }
    // }

    const selected = this.getSelected();
    if (selected.length === 1) {
      if (selected[0].Type === 'folder') {
        parentFolderID = selected[0].FolderID;
        path = selected[0].Path + '/' + selected[0].Name;
      } else {
        if (this.folderIDHistoryPosition == 0) {
          path = '';
          parentFolderID = '';
        } else {
          const currentFolder = this.nodeService.getFolderDTOByID(
            this.folderIDHistory[this.folderIDHistoryPosition]
          );
          parentFolderID = this.folderIDHistory[this.folderIDHistoryPosition];
          path = currentFolder.Path + '/' + currentFolder.FolderName;
        }
      }
    } else {
      if (this.folderIDHistoryPosition == 0) {
        path = '';
        parentFolderID = '';
      } else {
        const currentFolder = this.nodeService.getFolderDTOByID(
          this.folderIDHistory[this.folderIDHistoryPosition]
        );
        parentFolderID = this.folderIDHistory[this.folderIDHistoryPosition];
        path = currentFolder.Path + '/' + currentFolder.FolderName;
      }
    }

    this.entityName = this.nodeService.getUniqueName(
      this.entityName,
      path,
      'folder'
    );
    this.loading = true;
    this.folderService
      .createFolder(path, this.entityName, parentFolderID)
      .then((data) => {
        this.nodeService.addFolder(data);
        this.refreshTree();
        this.loading = false;
        this.createNewFolderDialogVisible = false;
        this.entityName = '';
      });
  }

  getEntityToMoveName() {
    if (this.entityToMove != null) {
      return '"' + this.entityToMove.data.name + '"';
    }
    return '';
  }

  getCurrentDirectoryName() {
    if (this.currentDirectory != null) {
      return '"' + this.currentDirectory.data.name + '"';
    }
    return 'Pick A Directory';
  }

  startMove() {
    if (this.getSelected().length > 0) {
      this.unselectAllMoveSelected();
      this.moveDialogVisible = true;
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Please Select a Folder or File to Move',
        detail: '',
      });
    }
  }

  async moveEntity() {
    const selected = this.getSelected();
    const movePromises = []; // Array to store all the move promises

    for (const entity of selected) {
      const key =
        entity.Type === 'folder' ? entity.FolderID : entity.MarkdownID;
      const targetFolderID = this.getMoveSelectedFolder().FolderID;

      // Create a promise for each entity's move
      const movePromise =
        entity.Type === 'folder'
          ? this.moveByKey(key, targetFolderID)
          : this.moveByKey(key, targetFolderID);

      movePromises.push(movePromise); // Store the promise in the array
    }

    // Await all the move promises to complete
    await Promise.all(movePromises);

    this.moveDialogVisible = false;
  }

  async createNewDocument() {
    this.createNewDocumentDialogVisible = false;
    let path: string | undefined = '';
    let parentFolderID: string | undefined = '';
    if (this.entityName == '') {
      this.entityName = 'New Document';
    }

    // if (this.currentDirectory != null) {
    //   if (this.currentDirectory.data.type === 'folder') {
    //     const folder = this.nodeService.getFolderDTOByID(
    //       this.currentDirectory.key
    //     );
    //     path = folder.Path;
    //     if (folder.Path !== '') path += `/${this.currentDirectory.data.name}`;
    //     else path += `${this.currentDirectory.data.name}`;
    //   } else {
    //     const file = this.nodeService.getFileDTOByID(this.currentDirectory.key);
    //     path = file.Path;
    //   }

    //   parentFolderID = this.currentDirectory.key;
    //   if (this.currentDirectory.data.type !== 'folder') {
    //     const file = this.nodeService.getFileDTOByID(this.currentDirectory.key);
    //     parentFolderID = file.ParentFolderID;
    //   }
    // }

    const selected = this.getSelected();
    if (selected.length === 1) {
      if (selected[0].Type === 'folder') {
        parentFolderID = selected[0].FolderID;
        path = selected[0].Path + '/' + selected[0].Name;
      } else {
        if (this.folderIDHistoryPosition == 0) {
          path = '';
          parentFolderID = '';
        } else {
          const currentFolder = this.nodeService.getFolderDTOByID(
            this.folderIDHistory[this.folderIDHistoryPosition]
          );
          parentFolderID = this.folderIDHistory[this.folderIDHistoryPosition];
          path = currentFolder.Path + '/' + currentFolder.FolderName;
        }
      }
    } else {
      if (this.folderIDHistoryPosition == 0) {
        path = '';
        parentFolderID = '';
      } else {
        const currentFolder = this.nodeService.getFolderDTOByID(
          this.folderIDHistory[this.folderIDHistoryPosition]
        );
        parentFolderID = this.folderIDHistory[this.folderIDHistoryPosition];
        path = currentFolder.Path + '/' + currentFolder.FolderName;
      }
    }

    this.entityName = this.nodeService.getUniqueName(
      this.entityName,
      path,
      'file'
    );
    this.loading = true;
    const check = await this.fileService.createDocument(
      this.entityName,
      path,
      parentFolderID
    );
    if (check) {
      this.entityName = '';
      this.createNewDocumentDialogVisible = false;
      this.navigateToPage('edit');
    }
    this.loading = false;
  }

  refreshTree() {
    const directory = this.nodeService.getTreeTableNodesData();
    this.filesDirectoryTree = this.generateTreeNodes(directory);
    this.nodeService.getTreeTableNodes().then((data) => {
      this.loadByParentID(this.folderIDHistory[this.folderIDHistoryPosition]);
      this.filesDirectoryTreeTable = data;
    });
    this.nodeService
      .getTreeTableNodes()
      .then((data) => (this.filteredFilesDirectoryTreeTable = data));
    this.treeTableColumns = [
      { field: 'name', header: 'Name' },
      { field: 'size', header: 'Size' },
      { field: 'type', header: 'Type' },
    ];
  }

  // @HostListener('document:keydown.enter', ['$event'])
  // handleEnterKeyPress(event: KeyboardEvent) {
  //   const selected = this.getSelected();
  //   if (selected.length === 1) {
  //     if (selected[0].Type === 'file') {
  //       this.onOpenFileSelect(selected[0].MarkdownID);
  //     }
  //     else if (selected[0].Type === 'folder') {
  //       this.openFolder(selected[0].FolderID);
  //     }
  //   }
  // }

  // @HostListener('document:keydown.delete', ['$event'])
  // handleDeleteKeyPress(event: KeyboardEvent) {
  //   const selected = this.getSelected();
  //   if (selected.length === 1) {
  //     this.deleteSelectedEntity(selected[0]);
  //   }
  // }

  openFileEnter(event: any): void { }

  deleteSelectedEntities(): void {
    const selected = this.getSelected();
    let entities = '';
    for (const entity of selected) {
      if (entity.Type == 'folder') entities += '"' + entity.FolderName + '", ';
      else entities += '"' + entity.Name + '", ';
    }
    entities = entities.substring(0, entities.length - 2);

    let message = `Are you sure that you want to delete ${entities} and all of its contents?`;
    if (selected.length > 1)
      message = `Are you sure that you want to delete ${entities} and all of their contents?`;

    this.confirmationService.confirm({
      message: message,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        let toastPoppedUp = false;
        let itemDeleted = false;
        for (const entity of selected) {
          // if (entity.SafeLock) {
          //   if (!toastPoppedUp)
          //     this.messageService.add({
          //       severity: 'warn',
          //       summary: 'You can only delete an unlocked document',
          //     });
          //   toastPoppedUp = true;
          //   continue;
          // } else {
          this.delete(entity);
          itemDeleted = true;
          // }
        }

        if (!itemDeleted) return;

        if (selected.length === 1)
          this.messageService.add({
            severity: 'success',
            summary: 'Item deleted successfully',
          });
        else
          this.messageService.add({
            severity: 'success',
            summary: 'Items deleted successfully',
          });
      },
      reject: () => { },
    });
  }

  openFileDoubleClick() {
    if (this.currentNode == this.previousNode && this.previousNode != null)
      this.onOpenFileSelect(this.previousNode);
    else {
    }
  }

  selectNode($event: any) {
    this.currentNode = $event.node;
  }

  unselectNode($event: any) {
    this.previousNode = $event.node;
  }

  // onNodeDrag($event: any) {
  //   this.isDraggingNode = true;
  //   const key = $event.source.element.nativeElement?.getAttribute('data-key');
  //   this.originalPosition = {
  //     x: $event.source._dragRef._passiveTransform.x,
  //     y: $event.source._dragRef._passiveTransform.y,
  //   };
  //   this.currentlyDraggedNode = this.getParentElement($event.event.srcElement);
  //   this.currentlyDraggedNode.style.pointerEvents = 'none';
  //   this.currentlyDraggedNode.classList.add('dragging');
  // }

  // onDragReleased($event: any) {
  //   this.currentlyDraggedNode.style.pointerEvents = 'auto';
  //   this.isDraggingNode = false;
  //   this.originalPosition = {
  //     x: $event.source._dragRef._passiveTransform.x,
  //     y: $event.source._dragRef._passiveTransform.y,
  //   };

  //   // Reset the draggable element's position back to its original position
  //   $event.source._dragRef.reset();
  //   setTimeout(async () => {
  //     const keyOfDragged = this.currentlyDraggedNode.getAttribute('data-key');
  //     const keyOfDropped = this.getParentElement(
  //       this.coordinateService.getElementAtCoordinate()
  //     )?.getAttribute('data-key');
  //     await this.moveByKey(keyOfDragged, keyOfDropped);
  //     if (this.currentlyDraggedNode) {
  //       this.currentlyDraggedNode.classList.remove('dragging');
  //     }
  //   }, 10);
  // }

  // getElementAtCoordinate(x: number, y: number): HTMLElement | null {
  //   return document.elementFromPoint(x, y) as HTMLElement;
  // }

  // getParentElement(currentElement: HTMLElement | null) {
  //   if (currentElement == null) return null;
  //   const parentElement: HTMLElement | null = currentElement.parentElement;

  //   if (parentElement) {
  //     return parentElement;
  //   } else {
  //     return null;
  //   }
  // }

  // getData(rowData: any) {
  //   return rowData.key;
  // }

  async moveByKey(
    keyOfDragged: string | undefined | null,
    keyOfDropped: string | undefined | null
  ) {
    if (keyOfDragged == keyOfDropped) return;
    const folder = this.nodeService.getParentFolderByID(keyOfDropped);

    let path: string | undefined = folder.Path + `/${folder.FolderName}`;
    let parentFolderID: string | undefined = folder.FolderID;
    if (folder.Path === '') {
      path = folder.FolderName;
    }

    if (!folder.FolderID) {
      path = '';
      parentFolderID = '';
    }

    const type = this.nodeService.checkType(keyOfDragged);
    if (type === 'file') {
      const movingNode = this.nodeService.getFileDTOByID(keyOfDragged);
      if (movingNode.ParentFolderID === parentFolderID) return;
      this.loading = true;
      this.fileService
        .moveDocument(movingNode.MarkdownID, path, parentFolderID)
        .then((data) => {
          this.nodeService.removeFile(movingNode.MarkdownID);
          data.Name = movingNode.Name;
          data.Size = movingNode.Size;
          this.nodeService.addFile(data);
          this.refreshTree();
          this.loading = false;
        });
    } else if (type === 'folder') {
      const movingNode = this.nodeService.getFolderDTOByID(keyOfDragged);
      if (movingNode.ParentFolderID === parentFolderID) return;
      //check if moving parent folder into some child folder
      if (this.nodeService.checkIfChildFolder(folder, movingNode)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Cannot move folder into child folder',
          detail: '',
        });
        return;
      }
      this.loading = true;
      this.folderService
        .moveFolder(movingNode.FolderID, path, parentFolderID)
        .then((data) => {
          this.nodeService.removeFolder(movingNode.FolderID);
          data.FolderName = movingNode.FolderName;

          this.nodeService.addFolder(data);
          this.refreshTree();
          this.loading = false;
        });
    }
  }

  loadByParentID(parentID: string) {
    this.unselectAll();
    this.contextMenu.hide();
    this.contextMenuVisible = false;
    this.currentFolders = [];
    this.currentFiles = [];
    const folders = this.nodeService.getFoldersByParentID(parentID);
    const files = this.nodeService.getFilesByParentID(parentID);

    for (let i = 0; i < folders.length; i++) {
      this.currentFolders.push(folders[i]);
    }
    for (let i = 0; i < files.length; i++) {
      this.currentFiles.push(files[i]);
    }
  }

  getSize(size: number) {
    if (size > 1000000000) {
      return (size / 1000000000).toFixed(2) + ' GB';
    } else if (size > 1000000) {
      return (size / 1000000).toFixed(2) + ' MB';
    } else if (size > 1000) {
      return (size / 1000).toFixed(2) + ' KB';
    } else {
      return size + ' B';
    }
  }

  formatDate(date: string): string {
    if (!date) return '';
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  openFolder(parentID: string) {
    if (this.folderIDHistory[this.folderIDHistoryPosition] === parentID) return;

    if (this.folderIDHistory.length > this.folderIDHistoryPosition + 1) {
      this.folderIDHistory.splice(
        this.folderIDHistoryPosition + 1,
        this.folderIDHistory.length - this.folderIDHistoryPosition - 1
      );
    }
    this.folderIDHistory.push(parentID);
    this.folderIDHistoryPosition++;

    localStorage.setItem(
      'folderIDHistory',
      JSON.stringify(this.folderIDHistory)
    );
    localStorage.setItem(
      'folderIDHistoryPosition',
      JSON.stringify(this.folderIDHistoryPosition)
    );
    this.loadByParentID(parentID);
  }

  toRoot() {
    if (this.folderIDHistoryPosition == 0) return;
    this.folderIDHistory = [];
    this.folderIDHistory.push('');
    this.folderIDHistoryPosition = 0;
    localStorage.setItem(
      'folderIDHistory',
      JSON.stringify(this.folderIDHistory)
    );
    localStorage.setItem(
      'folderIDHistoryPosition',
      JSON.stringify(this.folderIDHistoryPosition)
    );
    this.loadByParentID('');
  }

  undoFolder() {
    if (this.folderIDHistoryPosition > 0) {
      const parentID = this.folderIDHistory[--this.folderIDHistoryPosition];
      this.loadByParentID(parentID);
      localStorage.setItem(
        'folderIDHistory',
        JSON.stringify(this.folderIDHistory)
      );
      localStorage.setItem(
        'folderIDHistoryPosition',
        JSON.stringify(this.folderIDHistoryPosition)
      );
    }
  }

  redoFolder() {
    if (this.folderIDHistory.length > this.folderIDHistoryPosition + 1) {
      const parentID = this.folderIDHistory[++this.folderIDHistoryPosition];
      this.loadByParentID(parentID);
      localStorage.setItem(
        'folderIDHistory',
        JSON.stringify(this.folderIDHistory)
      );
      localStorage.setItem(
        'folderIDHistoryPosition',
        JSON.stringify(this.folderIDHistoryPosition)
      );
    }
  }

  upFolder() {
    if (this.folderIDHistoryPosition == 0) return;
    const parentID = this.folderIDHistory[this.folderIDHistoryPosition];
    const currDir = this.nodeService.getFolderDTOByID(parentID);
    if (currDir.ParentFolderID == null) return;
    this.openFolder(currDir.ParentFolderID);
  }

  renameFolder(folderID: string, path: string, newName: string) {
    if (newName === '') return;
    this.folderService.renameFolder(folderID, path, newName).then((data) => {
      this.nodeService.renameFolder(folderID, newName);
    });
  }

  renameFile(fileID: string, path: string, newName: string) {
    if (newName === '') return;
    this.fileService.renameDocument(fileID, newName, path).then((data) => {
      this.nodeService.renameFile(fileID, newName);
    });
  }

  handleClick(event: any, node: any) {
    this.contextMenu.hide();

    if (event.ctrlKey) {
      this.addToSelection(node);
    } else if (event.shiftKey) {
      this.selectFromNode(node);
    } else {
      this.selectOnlyOne(node);
    }
  }

  handleMoveClick(event: any, node: any) {
    node.MoveSelected = true;
    this.getAllFolders().forEach((element: any) => {
      if (element !== node) {
        element.MoveSelected = false;
      }
    });
  }

  handleRightClick(event: any, node: any) {
    this.zone.run(() => {
      // Your dynamic context menu updates here
      this.contextMenuItems[6] = {
        label: 'Lock Document',
        icon: 'pi pi-lock',
        command: () => {
          this.documentLockedPopup = true;

          const file = this.getSelected();
          if (file.length === 1) {
            this.documentPromise = this.fileService
              .retrieveDocument(file[0].MarkdownID, file[0].Path);
          }
        },
      };

      this.contextMenuItems[0].disabled = false;
      this.contextMenuItems[3].disabled = false;
      this.contextMenuItems[4].disabled = false;
      this.contextMenuItems[5].disabled = false;

      if (this.getSelected().length > 1) {
        this.contextMenuItems[0].disabled = true;
        this.contextMenuItems[4].disabled = true;
        this.contextMenuItems[6].disabled = true;
        this.contextMenuItems[7].disabled = true;
      }
      else {
        this.contextMenuItems[0].disabled = false;
        this.contextMenuItems[4].disabled = false;
        this.contextMenuItems[6].disabled = false;
        this.contextMenuItems[7].disabled = false;
      }

      if (node.Selected) {
      } else this.selectOnlyOne(node);

      if (this.getSelected().length === 1) {
        if (node.Type === 'folder') {
          this.contextMenuItems[6].disabled = true;
          this.contextMenuItems[7].disabled = true;
        } else {
          this.contextMenuItems[6].disabled = false;
          this.contextMenuItems[7].disabled = false;
          if (node.SafeLock) {
            this.contextMenuItems[6] = {
              label: 'Remove Lock',
              icon: 'pi pi-fw pi-lock-open',
              command: () => {
                this.removeDocumentLock = true;

                const file = this.getSelected();
                if (file.length === 1) {
                  this.documentPromise = this.fileService
                    .retrieveDocument(file[0].MarkdownID, file[0].Path);
                }
              }
            }
          }
        }
      }
      this.contextMenu.cd.detectChanges();
      this.contextMenuVisible = true;
    });

  }

  selectOnlyOne(node: any) {
    node.Selected = true;
    this.currentFolders.forEach((element: any) => {
      if (element !== node) {
        element.Selected = false;
      }
    });
    this.currentFiles.forEach((element: any) => {
      if (element !== node) {
        element.Selected = false;
      }
    });
    this.shiftClickStart = node;
  }

  addToSelection(node: any) {
    this.shiftClickStart = node;
    node.Selected = !node.Selected;
  }

  selectFromNode(node: any) {
    const selected = this.getSelected();
    if (selected.length === 0) {
      this.selectOnlyOne(node);
      return;
    }
    this.unselectAll();
    if (this.shiftClickStart === node) {
      node.Selected = true;
      return;
    }
    let startSelecting = false;
    this.shiftClickStart.Selected = true;
    node.Selected = true;
    const x = this.currentFolders.concat(this.currentFiles);

    let j = 0;
    for (; j < x.length; j++) {
      if (x[j] === this.shiftClickStart || x[j] === node) {

        break;
      }
    }
    let count = 0;
    for (let i = j; i < x.length; i++) {
      setTimeout(() => {
        const element = x[i];
        if (element === this.shiftClickStart || element === node) {
          startSelecting = !startSelecting;
          element.Selected = true;
        } else if (startSelecting) {
          element.Selected = true;
        }
      }, 20 * count++);

    }


  }

  getSelected() {

    let selected: any = [];
    this.currentFolders.forEach((element: any) => {
      if (element.Selected) {
        element.Type = 'folder';
        selected.push(element);
      }
    });
    this.currentFiles.forEach((element: any) => {
      if (element.Selected) {
        element.Type = 'file';
        selected.push(element);
      }
    });
    return selected;
  }

  unselectAll() {
    this.currentFolders.forEach((element: any) => {
      element.Selected = false;
    });
    this.currentFiles.forEach((element: any) => {
      element.Selected = false;
    });
  }

  getSelectedName(): string {
    const selected = this.getSelected();
    if (selected.length === 1) {
      if (selected[0].Type == 'folder') return selected[0].FolderName;
      return selected[0].Name;
    }
    return '';
  }

  renameEntity() {
    const selected = this.getSelected();
    if (selected.length === 1) {
      if (selected[0].Type == 'folder')
        this.renameFolder(
          selected[0].FolderID,
          selected[0].Path,
          this.entityRename
        );
      else
        this.renameFile(
          selected[0].MarkdownID,
          selected[0].Path,
          this.entityRename
        );
    }
  }

  lockClick($event: any, file: any) {
    $event.stopPropagation();
  }

  lockRightClick($event: any, file: any) {
    $event.stopPropagation();
  }

  onDragStart(event: DragEvent, obj: any) {
    // Prevent the default drag behavior

    // Set data to be transferred as plain text
    const data = JSON.stringify(obj);
    event.dataTransfer?.setData('text/plain', data);
  }

  onDrop(event: DragEvent, obj: any): void {
    const data = event.dataTransfer?.getData('text/plain');
    if (data) {
      // Handle the dropped data and use the drop target as needed

      const selected = this.getSelected();

      for (let i = 0; i < selected.length; i++) {
        if (selected[i].Type == 'folder') {
          this.moveByKey(selected[i].FolderID, obj.FolderID);
        } else {
          this.moveByKey(selected[i].MarkdownID, obj.FolderID);
        }
      }
    }
    obj.DraggedOver = false;
  }

  onDragOver(event: DragEvent, obj: any): void {
    event.preventDefault();
    event.stopPropagation();

    obj.DraggedOver = true;
  }
  onDragLeave(event: DragEvent, obj: any): void {
    event.preventDefault();
    event.stopPropagation();

    obj.DraggedOver = false;
  }

  getAllFolders(): any[] {
    let folders: any[] = [];

    if (this.folderIDHistoryPosition != 0) folders.push(this.rootFolder);
    this.nodeService.getFolders().forEach((element: any) => {
      if (
        !element.Selected &&
        element.FolderID != this.folderIDHistory[this.folderIDHistoryPosition]
      )
        folders.push(element);
    });
    return folders;
  }

  unselectAllMoveSelected(): void {
    this.getAllFolders().forEach((element: any) => {
      element.MoveSelected = false;
    });
  }

  getMoveSelectedFolder(): any {
    let folders = this.getAllFolders();
    for (let i = 0; i < folders.length; i++) {
      if (folders[i].MoveSelected) return folders[i];
    }
  }

  getCurrentFolderName(): string {
    if (this.folderIDHistory[this.folderIDHistoryPosition] === '')
      return 'Root';
    else {
      const folder = this.nodeService.getFolderDTOByID(
        this.folderIDHistory[this.folderIDHistoryPosition]
      );
      if (folder.FolderName) return folder.FolderName;
      else return '';
    }
  }

  out(x: number) {
  }

  async lockDocument() {

    const selected = this.getSelected();
    if (selected.length === 1) {
      if (this.userDocumentPassword == '') {
        this.messageService.add({
          severity: 'warn',
          summary: 'Please Enter a Password',
          detail: '',
        });
        // this.userDocumentPassword = '';

        return;
      }
      if (this.userDocumentPassword.length < 8) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Password must be at least 8 characters',
          detail: '',
        });
        // this.userDocumentPassword = '';

        return;
      }
      this.fileService
        .updateLockDocument(selected[0].MarkdownID, await this.documentPromise, this.userDocumentPassword, true, selected[0].Path);
      selected[0].SafeLock = true;

      this.userDocumentPassword = '';
      this.documentLockedPopup = false;
    }
  }

  async removeLock() {

    const selected = this.getSelected();
    if (selected.length === 1) {
      if (await this.fileService
        .updateLockDocument(selected[0].MarkdownID, await this.documentPromise, this.userDocumentPassword, false, selected[0].Path)) {
        selected[0].SafeLock = false;
        this.userDocumentPassword = '';
        this.removeDocumentLock = false;
      }
    }
  }

  async openLockedDocument() {
    const selected = this.getSelected();
    if (selected.length === 1) {
      const decryptedDocument = await this.fileService.decryptSafeLockDocument(await this.documentPromise, this.userDocumentPassword);
      if (decryptedDocument == null) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Incorrect Password',
          detail: '',
        });
      }
      else {
        this.editService.setAll(decryptedDocument, selected[0].MarkdownID, selected[0].Name, selected[0].Path, selected[0].ParentFolderID, true, this.userDocumentPassword);
        this.navigateToPage('edit');
      }
    }
  }

  enableContextMenu(event: MouseEvent, obj: any) {
    event.stopPropagation();
    if (!obj.Selected) {
      this.unselectAll();
      obj.Selected = true;
    }
    this.contextMenu.position(event);
    this.contextMenu.show(event);
    this.handleRightClick(event, obj);
  }

  touchObj: any;

  handleTouchStart(event: any, obj: any, type: string) {
    this.touchObj = obj;
  }

  handleTouchMove(event: any, obj: any, type: string) {
    this.touchObj = null;
  }

  handleTouchEnd(event: any, obj: any, type: string) {
    if (this.touchObj == obj) {
      if (this.contextMenuVisible) {
        this.contextMenuVisible = false;
        this.contextMenu.hide();
        return;
      }
      if (type == 'file') {
        this.onOpenFileSelect(obj.MarkdownID);
      }
      else if (type == 'folder') {
        this.openFolder(obj.FolderID);
      }
    }
    this.touchObj = null;
  }
  handleTouchStartCM(event: any, obj: any, type: string) {
    event.stopPropagation();
  }

  handleTouchMoveCM(event: any, obj: any, type: string) {
    event.stopPropagation();

  }

  handleTouchEndCM(event: any, obj: any, type: string) {
    event.stopPropagation();

  }

  handleDirectoryRightClick(event: any) {
    if (this.getSelected().length > 0) return;
    this.contextMenu.hide();
    this.contextMenuItems[0].disabled = true;
    this.contextMenuItems[3].disabled = true;
    this.contextMenuItems[4].disabled = true;
    this.contextMenuItems[5].disabled = true;
    this.contextMenuItems[6] = {
      label: 'Lock Document',
      icon: 'pi pi-lock',
      command: () => {
        this.documentLockedPopup = true;

        const file = this.getSelected();
        if (file.length === 1) {
          this.documentPromise = this.fileService
            .retrieveDocument(file[0].MarkdownID, file[0].Path);
        }
      },
    };
    this.contextMenuItems[6].disabled = true;
    this.contextMenuItems[7].disabled = true;
    this.contextMenu.cd.detectChanges();
    this.contextMenuVisible = true;
    this.contextMenu.position(event);
    this.contextMenu.show(event);
  }

  async shareDocument() {
    const selected = this.getSelected()[0];
    console.log(selected);
    if (selected.length > 1 || selected.type === 'folder') {
      return;
    }

    if (this.recipientEmail === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a recipient email',
      });
      return;
    }
    else {
      this.loading = true;
      await this.fileService.shareDocument(selected.MarkdownID, this.recipientEmail).then((data) => {
        if (data) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Document shared successfully',
          });
          this.sharePopup = false;
          this.recipientEmail = '';
        }
        this.loading = false;
      });
      this.loading = false;
    }
  }

  x = 0;
  addCssClass() {
    for (let i = 0; i < 10; i++) {
      const element = document.getElementById("logo");
      if(element){
        element.classList.remove(`rotation${i}`);
      }
    }
    const element = document.getElementById("logo");
    if(element){
      
      element.classList.add(`rotation${this.x++%10}`);
    }
    setTimeout(() => {
      if(element){
        element.classList.remove(`rotation${(this.x-1)%10}`);
      }
    }, 1000);
  }

  protected readonly focus = focus;
}
