import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
// import {NgModule} from "@angular/core";
import { Router } from '@angular/router';
import { TreeTable } from "primeng/treetable";
// import {Tree, TreeModule} from "primeng/tree";
// import {TreeSelectModule} from "primeng/treeselect";
// import {FormsModule} from "@angular/forms";
// import {EditorModule} from "primeng/editor";
// import {DropdownModule} from "primeng/dropdown";
// import {EditComponent} from "../edit/edit.component";

import { MenuItem, MessageService, TreeNode } from 'primeng/api';
import { NodeService } from "../services/home.service";
import { DialogService } from "primeng/dynamicdialog";
import { FileService } from "../services/file.service";
import { UserService } from '../services/user.service';
import { FileUploadPopupComponent } from "../file-upload-popup/file-upload-popup.component";
import { ViewChild } from '@angular/core';
import { EditService } from '../services/edit.service';
import { FolderService } from '../services/folder.service';
import { get } from 'cypress/types/lodash';

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
  public treeSelectedFile!: any;
  public directoryData!: any;
  public recentToggle: boolean = false;
  public selectToggle: boolean = false;
  public expandToggle: boolean = false;
  public rootToggle: boolean = false;
  public editToggle: boolean = false;
  public valueBeforeEdit: string = "";
  public colInspect: any;
  uploadedFiles: any[] = [];
  @ViewChild('myTreeTable') treeTable!: TreeTable;

  constructor(private router: Router,
    private nodeService: NodeService,
    private elementRef: ElementRef,
    private messageService: MessageService,
    private dialogService: DialogService, private fileService: FileService,
    private userService: UserService,
    private editService: EditService,
    private folderService: FolderService) {
  }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }
  // These functions serve to add intelligent routing and usage for directory management

  reloadMainFromRoot(): void {
    this.filterTable("", 3);
  }
  // The functions below serve to allow for editing and all other processes involved with editing
  // file names.
  onRowLabelEdit(event: any, rowNode: any): void {
    if (event !== this.valueBeforeEdit) {
      this.updateTreeNodeLabel(this.filesDirectoryTree, rowNode.node.key, event);
      this.updateTreeTableData(this.filteredFilesDirectoryTreeTable, rowNode.node.key, event);
      this.updateTreeTableData(this.filesDirectoryTreeTable, rowNode.node.key, event);
      this.sendEditedRowLabel(event, rowNode.node.key, rowNode.node.data.type);

    }
  }
  updateTreeTableData(nodes: TreeNode[], key: string, newValue: string): boolean {
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

  updateTreeNodeLabel(nodes: TreeNode[], key: string, newValue: string): boolean {
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
    console.log(event);
    console.log(key);
    console.log(type);
    //TODO Implement this function
    // sends the relevant information to the backend, that updates the file/folder's name
    // the name being the event. Yes, event will have to be validated to be sure it is a string

  }

  // End of functions that implement editing funcitonality.
  /**
   *
   * @JancoSpies, this function over here generates tree nodes from the  treetable data
   * in essence, all that's important is that the keys remain unique and in the format as seen in
   * home.service.ts
   */
  generateTreeNodes(data: any[]): TreeNode[] {
    return data.map(item => {
      const node: TreeNode = {
        key: item.key,
        label: item.data.name,
        data: item.data,
        children: this.generateTreeNodes(item.children || [])
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

        console.log(JSON.stringify(data));

        // Below is the function that populates the treeTable
        // Note, both filtered and non-filtered needs to be made and kept up to date,
        // as the non-filtered serves as the filter for the filters for the logic in the filter function
        // below
        this.nodeService.getTreeTableNodes().then((data) => {
            this.filesDirectoryTreeTable = data;
          }
        );
        this.nodeService.getTreeTableNodes().then((data) => (this.filteredFilesDirectoryTreeTable = data));
        this.treeTableColumns = [
          {field: 'name', header: 'Name'},
          {field: 'size', header: 'Size'},
          {field: 'type', header: 'Type'}
        ];
      });
      //Below is the code that populates the directoryPath
      // this.activeDirectoryItems = [{ label: 'Computer' }, { label: 'Notebook' }, { label: 'Accessories' }, { label: 'Backpacks' }, { label: 'Item' }];
      this.directoryHome = {icon: 'pi pi-home', routerLink: '/'};
      //Below is the code that populates the menu items, can be done intelligently with regards to current selection
      //in main window.
      document.getElementsByClassName("menubar");
      this.menuBarItems = this.getMenuItemsData();
      //Below is the code that populates the directories accordingly via the helper function, load directory
      //Below is the code for the speed dial menu
      //Can be done intelligently with that which is in focus in the main window
      this.speedDialItems = [
        {
          icon: 'pi pi-pencil',
          command: async () => {
            if (await this.fileService.createDocument())
              this.navigateToPage("edit");
          }
        },
        {
          icon: 'pi pi-refresh',
          command: () => {
            // this.messageService.add({ severity: 'success', summary: 'Update', detail: 'Data Updated' });
          }
        },
        {
          icon: 'pi pi-trash',
          command: () => {
            // this.messageService.add({ severity: 'error', summary: 'Delete', detail: 'Data Deleted' });
          }
        },
        {
          icon: 'pi pi-upload',
          command: () => {
            this.showFileUploadPopup();
          }
        },
        {
          icon: 'pi pi-external-link',
        }
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
    nodes.forEach(node => {
      node.expanded = collapseOrExpand;
      if (node.children && node.children.length > 0) {
        this.toggleAllNodes(node.children, collapseOrExpand);
      }
    });
    this.treeTable.isEmpty();
  }

  //TODO filter events from click on the left side directory contents need to rather use
  // a filter that finds the relevant directories via keys, not the actual text of the
  // file's name or something like that.
  filterTable(filterEvent: any, searchCollapseExpandRoot: number) {
    let filterValue = "";
    let explodeOrCollapse: boolean = true;
    if (1 == searchCollapseExpandRoot) {
      explodeOrCollapse = false;
      const collapsedNode = filterEvent.node;
      const parent = collapsedNode.parent as TreeNode;
      if (parent == undefined) {
        filterValue = "";
      }
      else if (parent.label != null) {
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
    console.log(filterValue)
    // Perform filtering based on the first column
    this.filteredFilesDirectoryTreeTable = this.filesDirectoryTreeTable.filter(node => {
      const name = node.data[this.treeTableColumns[0].field] as string;
      const hasMatchingChild = this.hasMatchingChildNode(node, filterValue);
      return name.toLowerCase().includes(filterValue.toLowerCase()) || hasMatchingChild;
    });
    // Perform explosion of all those nodes.
    this.toggleAllNodes(this.filteredFilesDirectoryTreeTable, explodeOrCollapse);
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
  // Below is the code that implements file uploading.
  onUpload(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
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
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#FFFFFF';
    this.elementRef.nativeElement.ownerDocument.body.style.margin = '0';
  }

  onOpenFileSelect(event: any): void {
    console.log(event);
    const file = this.nodeService.getFileDTOByID(event.key);
    console.log(file);
    this.fileService.retrieveDocument(file.MarkdownID, file.Path).then((data) => {
      this.editService.setContent(data);
      this.editService.setName(file.Name);
      this.editService.setMarkdownID(file.MarkdownID);
      this.editService.setParentFolderID(file.ParentFolderID);
      this.editService.setPath(file.Path);
      this.navigateToPage('edit');
    });
  }

  delete(event: any) {
    console.log('delete');
    this.fileService.deleteDocument(event.key);
    this.navigateToPage('home');
    this.deleteEntryByKey(this.filesDirectoryTree, event.key);
    this.deleteEntryByKey(this.filesDirectoryTreeTable, event.key);
    this.deleteEntryByKey(this.filteredFilesDirectoryTreeTable, event.key);
    this.filterTable("", 3);
    this.currentDirectory = null;
  }

  deleteEntryByKey(data: TreeNode[], keyToDelete: string): void {
    for (let i = 0; i < data.length; i++) {
      const currentNode = data[i];
      if (currentNode.key === keyToDelete) {
        data.splice(i, 1); // Remove the node at index i
        return; // Exit the function after deleting the entry
      }
      if (currentNode.children) {
        this.deleteEntryByKey(currentNode.children, keyToDelete);// Recursively check children nodes
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
                  //TODO Show dialog for creating a new folder
                }
              },
              {
                label: 'Document',
                icon: 'pi pi-fw pi-file',
                command: () => {
                  //TODO Show dialog for creating a new document
                }
              }
            ]
          },
    {
      label: 'Open',
      icon: 'pi pi-fw pi-folder',
      command: () => {
        if (this.currentDirectory!= null) this.onOpenFileSelect(this.currentDirectory);
        else {
          this.messageService.add({ severity: 'warn', summary: 'Please Select a Folder or File to Open', detail: 'Not mucho intelligento' })
        }
      }
    },
          {
            label: 'Delete',
            icon: 'pi pi-fw pi-trash',
            command:() => {
              if (this.currentDirectory!= null) this.delete(this.currentDirectory);
              else {
                this.messageService.add({ severity: 'warn', summary: 'Please select a folder or File to Delete', detail: 'You twat' })
              }
            }
          },
          {
            separator: true
          },
          {
            label: 'Export',
            icon: 'pi pi-fw pi-external-link',
            command:() => {
              //TODO implement downloading a file from the database
            }
          }
        ]
      },
      {
        label: 'Import',
        icon: 'pi pi-fw pi-pencil',
        items: [
          {
            label: 'Upload File',
            icon: 'pi pi-fw pi-upload'
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
            label: 'Archive',
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


  getUserFirstName(): string | undefined {
    return this.userService.getFirstName();
  }

  newFolder() {
    console.log('new folder');
    this.folderService.createFolder('', 'New Folder', '');
  }
  protected readonly focus = focus;
}

