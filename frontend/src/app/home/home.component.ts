import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private router: Router) {
  }

  navigateToPage(pageName: string) {
    this.router.navigate([`/${pageName}`]);
  }

  showNavbar(location: string) {

  }
//TODO implement function below
  ngOnInit(): void {
    // const treeItems = document.querySelectorAll('#visualDirectoryTree li');
    // for (let i = 0; i < treeItems.length; i++) {
    //   treeItems[i].addEventListener('click', (e) => {
    //     e.stopPropagation();
    //     (e.target as HTMLElement).classList.toggle('expanded');
    //     const childNodes = (e.target as HTMLElement).childNodes;
    //     for (let j = 0; j < childNodes.length; j++) {
    //       if (childNodes[j].nodeName === 'UL') {
    //         (childNodes[j] as HTMLElement).classList.toggle('expanded');
    //       }
    //     }
    //   });
    // }

  }
}
