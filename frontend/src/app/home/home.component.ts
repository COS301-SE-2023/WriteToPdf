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
  styleUrls: ['./home.component.scss']
})


export class HomeComponent implements OnInit {
  public filesDirectoryTree!: TreeNode[];
  public filesDirectoryTreeTable!: TreeNode[];
  public activeDirectoryItems!: MenuItem[];
  public directoryHome!: MenuItem;
  public menuBarItems!: MenuItem[];
  constructor(private router: Router, private nodeService: NodeService, private menuService: MenuService) {
  }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }

  showNavbar(location: string) {

  }

  ngOnInit(): void {
    {
      //Below is the function that populates the fileTree
      this.nodeService.getFiles().then((data) => (this.filesDirectoryTree = data));
      this.nodeService.getFilesystem().then((data) => (this.filesDirectoryTreeTable = data));
      //Below is the code that populates the directoryPath
      this.activeDirectoryItems = [{ label: 'Computer' }, { label: 'Notebook' }, { label: 'Accessories' }, { label: 'Backpacks' }, { label: 'Item' }];
      this.directoryHome = { icon: 'pi pi-home', routerLink: '/' };
      this.menuBarItems = this.menuService.getMenuItemsData();
    }
  }
}

