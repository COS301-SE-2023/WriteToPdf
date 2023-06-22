import {AfterViewInit, Component, ElementRef, OnInit} from '@angular/core';
// import {NgModule} from "@angular/core";
import {Router} from '@angular/router';
// import {Tree, TreeModule} from "primeng/tree";
// import {TreeSelectModule} from "primeng/treeselect";
// import {FormsModule} from "@angular/forms";
// import {EditorModule} from "primeng/editor";
// import {DropdownModule} from "primeng/dropdown";
// import {EditComponent} from "../edit/edit.component";
import {MenuItem, MessageService, TreeNode} from 'primeng/api';
import {MenuService, NodeService} from "./home.service";
import {DialogService} from "primeng/dynamicdialog";
import {FileUploadPopupComponent} from "../file-upload-popup/file-upload-popup.component";

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
  public currentDirectory!:TreeNode;
  public treeSelectedFile!:any;
  public recentToggle: boolean = false;
  public selectToggle: boolean = false;
  public expandToggle: boolean = false;
  public sharedToggle: boolean = false;
  public editToggle: boolean = false;
  public valueBeforeEdit: string = "";
  public colInspect: any;
  uploadedFiles: any[] = [];
  constructor(private router: Router, private nodeService: NodeService, private menuService: MenuService, private elementRef: ElementRef, private messageService:MessageService, private dialogService: DialogService) {
  }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }


  onRowLabelEdit(event: any, rowNode: any): void {
    if(event !== this.valueBeforeEdit){
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

  sendEditedRowLabel(event: any, key: string, type:string): void {
    console.log(event);
    console.log(key);
    console.log(type);
    //TODO Implement this function
    // sends the relevant information to the backend, that updates the file/folder's name
    // the name being the event. Yes, event will have to be validated to be sure it is a string

  }

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

  ngOnInit(): void {
    {
      // Below is the function that initially populates the fileTree
      const data = this.nodeService.getTreeTableNodesData();
      this.filesDirectoryTree = this.generateTreeNodes(data);
      // Below is the function that populates the treeTable
      // Note, both filtered and non-filtered needs to be made and kept up to date,
      // as the non-filtered serves as the filter for the filters for the logic in the filter function
      // below
      this.nodeService.getTreeTableNodes().then((data) => {
        this.filesDirectoryTreeTable = data;}
      );
      this.nodeService.getTreeTableNodes().then((data) => (this.filteredFilesDirectoryTreeTable = data));
      this.treeTableColumns = [
        { field: 'name', header: 'Name' },
        { field: 'size', header: 'Size' },
        { field: 'type', header: 'Type' }
      ];
      //Below is the code that populates the directoryPath
      // this.activeDirectoryItems = [{ label: 'Computer' }, { label: 'Notebook' }, { label: 'Accessories' }, { label: 'Backpacks' }, { label: 'Item' }];
      this.directoryHome = { icon: 'pi pi-home', routerLink: '/' };
      //Below is the code that populates the menu items, can be done intelligently with regards to current selection
      //in main window.
      this.menuBarItems = this.menuService.getMenuItemsData();
      document.getElementsByClassName("menubar");
      //Below is the code that populates the directories accordingly via the helper function, load directory
      //Below is the code for the speed dial menu
      //Can be done intelligently with that which is in focus in the main window
      this.speedDialItems = [
        {
          icon: 'pi pi-pencil',
          command: () => {
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
    }
  }
  // Below are the functions that implement intelligent routing of the directory tree on the left side of the home page
  // it routes the relevant directory to the main window

  onNodeExpand(event: any): void {
    this.filterTable(event, false);
  }

  onNodeCollapse(event: any): void {
    this.filterTable(event, true);
  }
  // end of functions implementing routing of directory tree to the main window

  // below the code that Filter's the table, which is also called when the tree nodes are expanded
  // or collapsed.
  filterTable(filterEvent: any, fromCollapse: boolean) {
    let filterValue = "";
    if(fromCollapse){
      const collapsedNode = filterEvent.node;
      const parent = collapsedNode.parent as TreeNode;
      const filterValue = parent?.data.label;
    }
    else filterValue = filterEvent.target.value;
    // Perform filtering based on the first column
    this.filteredFilesDirectoryTreeTable = this.filesDirectoryTreeTable.filter(node => {
      const name = node.data[this.treeTableColumns[0].field] as string;
      const hasMatchingChild = this.hasMatchingChildNode(node, filterValue);
      return name.toLowerCase().includes(filterValue.toLowerCase()) || hasMatchingChild;
    });
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
  onUpload(event:any) {
    for(let file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.messageService.add({severity: 'info', summary: 'File Uploaded', detail: ''});
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

  protected readonly focus = focus;
}

