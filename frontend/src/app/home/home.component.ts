import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
} from '@angular/core';
// import {NgModule} from "@angular/core";
import { Router } from '@angular/router';
import { TreeTable } from 'primeng/treetable';

import { MenuItem, MessageService, TreeNode } from 'primeng/api';
import { NodeService } from '../services/home.service';
import { DialogService } from 'primeng/dynamicdialog';
import { FileService } from '../services/file.service';
import { UserService } from '../services/user.service';
import { FileManagerPopupComponent } from '../file-manager-popup/file-manager-popup.component';
import { FileUploadPopupComponent } from '../file-upload-popup/file-upload-popup.component';
import { ViewChild } from '@angular/core';
import { EditService } from '../services/edit.service';
import { FolderService } from '../services/folder.service';
import { Inject } from '@angular/core';
import { CoordinateService } from '../services/coordinate-service.service';

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
  public createNewDocumentDialogueVisible: boolean = false;
  public createNewFolderDialogueVisible: boolean = false;
  public entityName: string = '';
  uploadedFiles: any[] = [];
  contextMenuItems: any[];
  @ViewChild('myTreeTable') treeTable!: TreeTable;

  constructor(
    @Inject(Router) private router: Router,

    private nodeService: NodeService,
    private elementRef: ElementRef,
    private messageService: MessageService,
    private dialogService: DialogService,
    private fileService: FileService,
    private userService: UserService,
    private editService: EditService,
    private folderService: FolderService,
    private renderer: Renderer2,
    private coordinateService: CoordinateService
  ) {
    this.contextMenuItems = [
      {
        label: 'Create New Folder',
        icon: 'pi pi-folder-plus',
        // command: () => this.createNewFolder()
      },
      {
        label: 'Create New File',
        icon: 'pi pi-file',
        // command: () => this.createNewFile()
      },
      {
        label: 'Enclose in Folder',
        icon: 'pi pi-folder-plus',
        // command: () => this.encloseSelectionInFolder()
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        // command: () => this.deleteSelection()
      },
    ];
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
    console.log(event, key, type);
    if (type === 'folder') {
      const folder = this.nodeService.getFolderDTOByID(key);
      this.folderService
        .renameFolder(folder.FolderID, folder.Path, event)
        .then((data) => {});
    } else {
      const file = this.nodeService.getFileDTOByID(key);
      this.fileService
        .renameDocument(file.MarkdownID, event, file.Path)
        .then((data) => {});
    }
  }

  // End of functions that implement editing functionality.
  generateTreeNodes(data: any[]): TreeNode[] {
    return data.map((item) => {
      const node: TreeNode = {
        key: item.key,
        label: item.data.name,
        data: item.data,
        children: this.generateTreeNodes(item.children || []),
      };
      return node;
    });
  }

  async ngOnInit() {
    {
      // Below is the function that initially populates the fileTree
      this.nodeService.getFilesAndFolders().then(() => {
        const data = this.nodeService.getTreeTableNodesData();
        this.filesDirectoryTree = this.generateTreeNodes(data);

        // Below is the function that populates the treeTable
        // Note, both filtered and non-filtered needs to be made and kept up to date,
        // as the non-filtered serves as the filter for the filters for the logic in the filter function
        // below
        this.nodeService.getTreeTableNodes().then((data) => {
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
            this.createNewDocumentDialogueVisible = true;
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
    }
  }

  onNodeSelect(event: any): void {
    this.filterTable(event, 2);
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
      console.log(filterValue);
    }
    if (0 == searchCollapseExpandRoot) {
      explodeOrCollapse = false;
      filterValue = filterEvent.target.value;
    }
    if (3 == searchCollapseExpandRoot) {
      filterValue = filterEvent;
      explodeOrCollapse = false;
    }
    console.log(filterValue);
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

  /**
   *
   * @param options, must be "folder" || "move" || "document"
   */
  showFileManagerPopup(options: string): void {
    if (options === 'folder') {
      //TODO communicate intentions to file manager pop-up
      const ref = this.dialogService.open(FileManagerPopupComponent, {
        header: 'Folder Creation: Select location',
        showHeader: true,
        closable: true,
        closeOnEscape: true,
        dismissableMask: true,
      });
      ref.onClose.subscribe(() => {
        //If the user creates a new folder we want it to be reflected in our home page,
        //So we need to call ngOnInit once more to update the homepage after closing.
        this.ngOnInit();
        // Handle any actions after the dialog is closed
      });
    }
    if (options === 'move') {
      //TODO communicate intentions to file manager pop-up
      const ref = this.dialogService.open(FileManagerPopupComponent, {
        header: 'Select new location',
        showHeader: true,
        closable: true,
        closeOnEscape: true,
        dismissableMask: true,
      });
      ref.onClose.subscribe(() => {
        // Handle any actions after the dialog is closed
      });
    }
    if (options === 'document') {
      //TODO communicate intentions to file manager pop-up
      const ref = this.dialogService.open(FileManagerPopupComponent, {
        header: 'Select document location',
        showHeader: true,
        closable: true,
        closeOnEscape: true,
        dismissableMask: true,
      });
      ref.onClose.subscribe(() => {
        // Handle any actions after the dialog is closed
      });
    }
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

  // this code updates the background layer to not be adjusted from the edit page after navigation.
  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#FFFFFF';
    this.elementRef.nativeElement.ownerDocument.body.style.margin = '0';
  }

  onOpenFileSelect(event: any): void {
    const file = this.nodeService.getFileDTOByID(event.key);
    console.log('FILE: ' + JSON.stringify(file));
    this.fileService
      .retrieveDocument(file.MarkdownID, file.Path)
      .then((data) => {
        console.log('Data retrieved on file open: ' + data);
        this.editService.setContent(data);
        this.editService.setName(file.Name);
        this.editService.setMarkdownID(file.MarkdownID);
        console.log('Parent Folder ID: ' + file.ParentFolderID);
        this.editService.setParentFolderID(file.ParentFolderID);
        this.editService.setPath(file.Path);
        this.navigateToPage('edit');
      });
  }

  onMoveFileSelect(
    event: any,
    newPath: string,
    newParentFolderID: string
  ): void {
    console.log(event);
    const file = this.nodeService.getFileDTOByID(event.key);
    this.entityToMove = event;
    this.showFileManagerPopup('move');
    this.moveDialogVisible = true;
    console.log(file);
  }

  //TODO - implement the move folder function
  onMoveFolderSelect(
    event: any,
    newPath: string,
    newParentFolderID: string
  ): void {
    console.log(event);
    const folder = this.nodeService.getFolderDTOByID(event.key);
    this.entityToMove = event;
    this.moveDialogVisible = true;
    console.log(folder);
  }

  delete(event: any) {
    console.log('delete');
    console.log(event);
    if (event.data.type == 'folder') {
      this.folderService.deleteFolder(event.key);
      this.deleteEntryByKey(this.filesDirectoryTree, event.key);
      this.deleteEntryByKey(this.filesDirectoryTreeTable, event.key);
      this.deleteEntryByKey(this.filteredFilesDirectoryTreeTable, event.key);
      this.filterTable('', 3);
      this.nodeService.removeFolder(event.key);
      this.refreshTree();
      this.currentDirectory = null;
    } else {
      this.fileService.deleteDocument(event.key);
      this.deleteEntryByKey(this.filesDirectoryTree, event.key);
      this.deleteEntryByKey(this.filesDirectoryTreeTable, event.key);
      this.deleteEntryByKey(this.filteredFilesDirectoryTreeTable, event.key);
      this.filterTable('', 3);
      this.nodeService.removeFile(event.key);
      this.refreshTree();
      this.currentDirectory = null;
    }
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
                  this.showFileManagerPopup('folder');
                  this.createNewFolderDialogueVisible = true;
                },
              },
              {
                label: 'Document',
                icon: 'pi pi-fw pi-file',
                command: () => {
                  this.showFileManagerPopup('document');
                  this.createNewDocumentDialogueVisible = true;
                },
              },
            ],
          },
          {
            label: 'Open',
            icon: 'pi pi-fw pi-folder',
            command: () => {
              if (this.currentDirectory != null)
                this.onOpenFileSelect(this.currentDirectory);
              else {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Please Select a Folder or File to Open',
                  detail: '',
                });
              }
            },
          },
          {
            label: 'Move',
            icon: 'pi pi-fw pi-arrow-right',
            command: () => {
              if (this.currentDirectory != null)
                this.onMoveFileSelect(this.currentDirectory, '', '');
              else {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Please Select a Folder or File to Move',
                  detail: '',
                });
              }
            },
          },
          {
            label: 'Delete',
            icon: 'pi pi-fw pi-trash',
            command: () => {
              if (this.currentDirectory != null)
                this.delete(this.currentDirectory);
              else {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Please select a folder or File to Delete',
                  detail: '',
                });
              }
            },
          },
          {
            separator: true,
          },
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
        icon: 'pi pi-fw pi-pencil',
        items: [
          {
            label: 'Upload File',
            icon: 'pi pi-fw pi-upload',
            command: () => {
              this.showFileUploadPopup();
            },
          },
        ],
      },
      {
        label: 'Quit',
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

  async newFolder() {
    let path: string | undefined = '';
    let parentFolderID: string | undefined = '';
    if (this.entityName == '') {
      this.entityName = 'New Folder';
    }

    if (this.currentDirectory != null) {
      if (this.currentDirectory.data.type === 'folder') {
        const folder = this.nodeService.getFolderDTOByID(
          this.currentDirectory.key
        );
        path = folder.Path;
        if (folder.Path !== '') path += `/${this.currentDirectory.data.name}`;
        else path += `${this.currentDirectory.data.name}`;
      } else {
        const file = this.nodeService.getFileDTOByID(this.currentDirectory.key);
        path = file.Path;
      }

      parentFolderID = this.currentDirectory.key;
      if (this.currentDirectory.data.type !== 'folder') {
        const file = this.nodeService.getFileDTOByID(this.currentDirectory.key);
        parentFolderID = file.ParentFolderID;
      }
    }

    this.entityName = this.nodeService.getUniqueName(
      this.entityName,
      path,
      'folder'
    );

    this.folderService
      .createFolder(path, this.entityName, parentFolderID)
      .then((data) => {
        this.nodeService.addFolder(data);
        this.refreshTree();
        this.createNewFolderDialogueVisible = false;
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

  moveEntity() {
    this.moveByKey(this.entityToMove.data.key, this.currentDirectory.key);
    this.moveDialogVisible = false;
  }

  async createNewDocument() {
    let path: string | undefined = '';
    let parentFolderID: string | undefined = '';
    if (this.entityName == '') {
      this.entityName = 'New Document';
    }

    if (this.currentDirectory != null) {
      if (this.currentDirectory.data.type === 'folder') {
        const folder = this.nodeService.getFolderDTOByID(
          this.currentDirectory.key
        );
        path = folder.Path;
        if (folder.Path !== '') path += `/${this.currentDirectory.data.name}`;
        else path += `${this.currentDirectory.data.name}`;
      } else {
        const file = this.nodeService.getFileDTOByID(this.currentDirectory.key);
        path = file.Path;
      }

      parentFolderID = this.currentDirectory.key;
      if (this.currentDirectory.data.type !== 'folder') {
        const file = this.nodeService.getFileDTOByID(this.currentDirectory.key);
        parentFolderID = file.ParentFolderID;
      }
    }

    this.entityName = this.nodeService.getUniqueName(
      this.entityName,
      path,
      'file'
    );

    if (
      await this.fileService.createDocument(
        this.entityName,
        path,
        parentFolderID
      )
    ) {
      this.entityName = '';
      this.createNewDocumentDialogueVisible = false;
      this.navigateToPage('edit');
    }
  }

  refreshTree() {
    const directory = this.nodeService.getTreeTableNodesData();
    this.filesDirectoryTree = this.generateTreeNodes(directory);
    this.nodeService.getTreeTableNodes().then((data) => {
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
    this.filterTable('', 3);
  }

  openFileEnter(event: any): void {
    if (this.currentNode != null) this.onOpenFileSelect(this.currentNode);
    else {
    }
  }

  deleteSelectedEntity(event: any): void {
    if (this.currentDirectory != null) this.delete(this.currentDirectory);
  }

  openFileDoubleClick() {
    console.log('UNIQUE: ' + this.currentDirectory);
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

  onNodeDrag($event: any) {
    this.isDraggingNode = true;
    console.log('Drag start: ', $event);
    const key = $event.source.element.nativeElement?.getAttribute('data-key');
    console.log('Key: ', JSON.stringify(key));
    this.originalPosition = {
      x: $event.source._dragRef._passiveTransform.x,
      y: $event.source._dragRef._passiveTransform.y,
    };
    this.currentlyDraggedNode = this.getParentElement($event.event.srcElement);
    this.currentlyDraggedNode.style.pointerEvents = 'none';
    this.currentlyDraggedNode.classList.add('dragging');
  }

  onDragReleased($event: any) {
    this.currentlyDraggedNode.style.pointerEvents = 'auto';
    this.isDraggingNode = false;
    this.originalPosition = {
      x: $event.source._dragRef._passiveTransform.x,
      y: $event.source._dragRef._passiveTransform.y,
    };

    // Reset the draggable element's position back to its original position
    $event.source._dragRef.reset();
    setTimeout(() => {
      const keyOfDragged = this.currentlyDraggedNode.getAttribute('data-key');
      const keyOfDropped = this.getParentElement(
        this.coordinateService.getElementAtCoordinate()
      )?.getAttribute('data-key');
      console.log('Key of dragged: ', keyOfDragged);
      console.log('Key of dropped: ', keyOfDropped);

      this.moveByKey(keyOfDragged, keyOfDropped);
    }, 10);
    if (this.currentlyDraggedNode) {
      this.currentlyDraggedNode.classList.remove('dragging');
    }
  }

  getElementAtCoordinate(x: number, y: number): HTMLElement | null {
    return document.elementFromPoint(x, y) as HTMLElement;
  }

  getParentElement(currentElement: HTMLElement | null) {
    if (currentElement == null) return null;
    const parentElement: HTMLElement | null = currentElement.parentElement;

    if (parentElement) {
      return parentElement;
    } else {
      return null;
    }
  }

  getData(rowData: any) {
    return rowData.key;
  }

  moveByKey(
    keyOfDragged: string | undefined | null,
    keyOfDropped: string | undefined | null
  ) {
    if (keyOfDragged == keyOfDropped) return;
    const folder = this.nodeService.getParentFolderByID(keyOfDropped);

    let path: string | undefined = folder.Path + `/${folder.FolderName}`;
    if (folder.Path === '') {
      path = folder.FolderName;
    }

    const type = this.nodeService.checkType(keyOfDragged);
    if (type === 'file') {
      const movingNode = this.nodeService.getFileDTOByID(keyOfDragged);
      if(movingNode.ParentFolderID === folder.FolderID) return;
      console.log('Folder:', folder);
      this.fileService
        .moveDocument(movingNode.MarkdownID, path, folder.FolderID)
        .then((data) => {
          this.nodeService.removeFile(movingNode.MarkdownID);
          data.Name = movingNode.Name;
          data.Size = movingNode.Size;
          this.nodeService.addFile(data);
          this.refreshTree();
        });
    } else if (type === 'folder') {
      const movingNode = this.nodeService.getFolderDTOByID(keyOfDragged);
      if (movingNode.ParentFolderID === folder.FolderID) return;
      this.folderService
        .moveFolder(movingNode.FolderID, path, folder.FolderID)
        .then((data) => {
          this.nodeService.removeFolder(movingNode.FolderID);
          data.FolderName = movingNode.FolderName;

          this.nodeService.addFolder(data);
          this.refreshTree();
        });
    }
  }

  protected readonly focus = focus;
}
