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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})


export class HomeComponent implements OnInit {
  public files!: TreeNode[];
  public directoryItems!: MenuItem[];
  public directoryHome!: MenuItem;
  constructor(private router: Router, private nodeService: NodeService) {
  }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }

  showNavbar(location: string) {

  }

//TODO implement function below
  ngOnInit(): void {
    {
      //Below is the function that populates the fileTree
      this.nodeService.getFiles().then((data) => (this.files = data));
      //Below is the code that populates the directoryPath
      this.directoryItems = [{ label: 'Computer' }, { label: 'Notebook' }, { label: 'Accessories' }, { label: 'Backpacks' }, { label: 'Item' }];
      this.directoryHome = { icon: 'pi pi-home', routerLink: '/' };
    }
  }
}

