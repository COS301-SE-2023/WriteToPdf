import {Component, OnInit} from '@angular/core';
import {NgModule} from "@angular/core";
import {Router} from '@angular/router';
import {Tree, TreeModule} from "primeng/tree";
import {TreeSelectModule} from "primeng/treeselect";
import {FormsModule} from "@angular/forms";
import {EditorModule} from "primeng/editor";
import {DropdownModule} from "primeng/dropdown";
import {EditComponent} from "../edit/edit.component";
// import { NodeService } from '../../service/nodeservice';

interface TreeNode {
  label: string;
  data?: any;
  expandedIcon?: string;
  collapsedIcon?: string;
  children?: TreeNode[];
}
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})


export class HomeComponent implements OnInit {
  nodes: any;
  selectedNodes: any;

  constructor(private router: Router) {
    // this.selectedNodes = [];
    // this.nodes = [
    //   {
    //     label: 'Folder 1',
    //     expandedIcon: 'pi pi-folder-open',
    //     collapsedIcon: 'pi pi-folder',
    //     children: [
    //       {
    //         label: 'File 1',
    //         // icon: 'pi pi-file'
    //       },
    //       {
    //         label: 'File 2',
    //         // icon: 'pi pi-file'
    //       }
    //     ]
    //   },
    //   {
    //     label: 'Folder 2',
    //     expandedIcon: 'pi pi-folder-open',
    //     collapsedIcon: 'pi pi-folder',
    //     children: [
    //       {
    //         label: 'File 3',
    //         // icon: 'pi pi-file'
    //       }
    //     ]
    //   }
    // ];
  }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }

  showNavbar(location: string) {

  }

//TODO implement function below
  ngOnInit(): void {
    {
      // Populate your tree nodes here
      //   this.nodes = [
      //     {
      //       label: 'Folder 1',
      //       expandedIcon: 'pi pi-folder-open',
      //       collapsedIcon: 'pi pi-folder',
      //       children: [
      //         {
      //           label: 'File 1',
      //           // icon: 'pi pi-file'
      //         },
      //         {
      //           label: 'File 2',
      //           // icon: 'pi pi-file'
      //         }
      //       ]
      //     },
      //     {
      //       label: 'Folder 2',
      //       expandedIcon: 'pi pi-folder-open',
      //       collapsedIcon: 'pi pi-folder',
      //       children: [
      //         {
      //           label: 'File 3',
      //           // icon: 'pi pi-file'
      //         }
      //       ]
      //     }
      //   ];
    }
  }
}

