import {Component, OnInit} from '@angular/core';
// import {NgModule} from "@angular/core";
import {Router} from '@angular/router';
// import {Tree, TreeModule} from "primeng/tree";
// import {TreeSelectModule} from "primeng/treeselect";
// import {FormsModule} from "@angular/forms";
// import {EditorModule} from "primeng/editor";
// import {DropdownModule} from "primeng/dropdown";
// import {EditComponent} from "../edit/edit.component";
import {TreeNode, MenuItem} from 'primeng/api';
import {NodeService} from "./home.service";
import {MenuService} from "./home.service";
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})

export class HomeComponent implements OnInit {
  public filesDirectoryTree!: TreeNode[];
  public filesDirectoryTreeTable!: TreeNode[];
  public activeDirectoryItems!: MenuItem[];
  public directoryHome!: MenuItem;
  public menuBarItems!: MenuItem[];
  public speedDialItems!: MenuItem[];
  public currentDirectory!:TreeNode;
  constructor(private router: Router, private nodeService: NodeService, private menuService: MenuService) {
  }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }

  loadDirectory() {
    this.activeDirectoryItems = [{ label: 'Home'}];
    this.nodeService.getFiles().then((data) => (this.filesDirectoryTree = data));
    this.nodeService.getFilesystem().then((data) => (this.filesDirectoryTreeTable = data));
    this.activeDirectoryItems = this.nodeService.getFilesAndDirectories(this.currentDirectory); // Retrieve the active directory's files and directories

  }

  //TODO implement the function below to render the Homepage's directory structures appropriately.
  // onNodeSelect(event) {
  //   this.currentDirectory = event.node;
  //   this.activeFilesAndDirectories = this.nodeService.getFilesAndDirectories(this.currentDirectory);
  //   // Update the breadcrumb with the selected directory
  //   this.breadcrumbService.setItems([
  //     { label: 'Home', routerLink: '/' },
  //     { label: this.currentDirectory.label }
  //   ]);
  // }


  ngOnInit(): void {
    {
      //Below is the function that populates the fileTree
      this.nodeService.getFiles().then((data) => (this.filesDirectoryTree = data));
      this.nodeService.getFilesystem().then((data) => (this.filesDirectoryTreeTable = data));
      //Below is the code that populates the directoryPath
      this.activeDirectoryItems = [{ label: 'Computer' }, { label: 'Notebook' }, { label: 'Accessories' }, { label: 'Backpacks' }, { label: 'Item' }];
      this.directoryHome = { icon: 'pi pi-home', routerLink: '/' };
      //Below is the code that populates the menu items, can be done intelligently with regards to current selection
      //in main window.
      this.menuBarItems = this.menuService.getMenuItemsData();
      document.getElementsByClassName("menubar");
      //Below is the code that populates the directories accordingly via the helper function, load directory
      this.loadDirectory();
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
}

