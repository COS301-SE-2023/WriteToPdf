import {Component, ElementRef, OnInit} from '@angular/core';
// import {NgModule} from "@angular/core";
import {Router} from '@angular/router';
// import {Tree, TreeModule} from "primeng/tree";
// import {TreeSelectModule} from "primeng/treeselect";
// import {FormsModule} from "@angular/forms";
// import {EditorModule} from "primeng/editor";
// import {DropdownModule} from "primeng/dropdown";
// import {EditComponent} from "../edit/edit.component";
import {TreeNode, MenuItem, MessageService} from 'primeng/api';
import {NodeService} from "./home.service";
import {MenuService} from "./home.service";
interface Column {
  field: string;
  header: string;
}
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})



export class HomeComponent implements OnInit {
  public filesDirectoryTree!: TreeNode[];
  public filesDirectoryTreeTable!: TreeNode[];
  public filteredFilesDirectoryTreeTable!: TreeNode[];
  public activeDirectoryItems!: MenuItem[];
  public directoryHome!: MenuItem;
  public menuBarItems!: MenuItem[];
  public speedDialItems!: MenuItem[];
  public treeTableColumns!: Column[];
  public currentDirectory!:TreeNode;

  constructor(private router: Router, private nodeService: NodeService, private menuService: MenuService, private elementRef: ElementRef) {
  }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }

  // loadDirectory() {
  //   this.activeDirectoryItems = [{ label: 'Home'}];
  //   this.nodeService.getFiles().then((data) => (this.filesDirectoryTree = data));
  //   this.nodeService.getFilesystem().then((data) => (this.filesDirectoryTreeTable = data));
  //   this.activeDirectoryItems = this.nodeService.getFilesAndDirectories(this.currentDirectory); // Retrieve the active directory's files and directories
  //
  // }

  onNodeSelect(event: any) {
    const node = event.node;
    this.updateBreadcrumb(node);
    this.updateCurrentDirectory(node);
  }
  updateBreadcrumb(selectedNode: TreeNode | undefined) {
    // Clear the existing breadcrumb items
    this.activeDirectoryItems = [];

    // Traverse the selected node's ancestors to generate the breadcrumb items
    let currentNode = selectedNode ;
    while (currentNode) {
      this.activeDirectoryItems.unshift({ label: currentNode.label });
      currentNode = currentNode.parent;
    }
  }

  updateCurrentDirectory(selectedNode: TreeNode) {
    // Update the current directory data based on the selected node
    this.filesDirectoryTreeTable = []; // Replace with the logic to fetch the directory data for the selected node
  }

  onRowLabelEdit(rowData: TreeNode): void {
    // Send the updated row label to the backend
    this.sendEditedRowLabel(rowData);
  }

  sendEditedRowLabel(rowData: TreeNode): void {
    const editedLabel = rowData.data[this.treeTableColumns[0].field];
    // Make an HTTP request to your backend API with the edited label
    /**
     * @Backend, here's an event listener that sends the EditedRowLabel data to the
     * backend, please tell me how I Should implement this.
     */
    //TODO Implement this function commented below

    // this.http.post<any>('your-backend-url', { editedLabel })
    //   .subscribe(response => {
    //     // Handle the response from the backend if needed
    //   });
  }


  ngOnInit(): void {
    {
      //Below is the function that initially populates the fileTree
      this.nodeService.getFiles().then((data) => (this.filesDirectoryTree = data));
      // Below is the function that populates the treeTable
      this.nodeService.getFilesystem().then((data) => (this.filesDirectoryTreeTable = data));
      this.nodeService.getFilesystem().then((data) => (this.filteredFilesDirectoryTreeTable = data));
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
          // routerLink: []
        },
        {
          icon: 'pi pi-external-link',
        }
      ];
    }
  }
  filterTable(filterEvent: any) {
    let filterValue = filterEvent.target.value;
    // Perform filtering based on the first column
    this.filteredFilesDirectoryTreeTable = this.filesDirectoryTreeTable.filter(node => {
      const name = node.data[this.treeTableColumns[0].field] as string;
      const hasMatchingChild = this.hasMatchingChildNode(node, filterValue);
      return name.toLowerCase().includes(filterValue.toLowerCase()) || hasMatchingChild;
    });
  }

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

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '#FFFFFF';
    this.elementRef.nativeElement.ownerDocument.body.style.margin = '0';
  }
}

