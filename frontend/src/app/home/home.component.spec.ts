import 'zone.js/dist/zone.js';
import 'zone.js/dist/zone-testing.js'; // Must add both these imports
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { HomeComponent } from './home.component';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { MenuService, NodeService } from './home.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { SpeedDialModule } from 'primeng/speeddial';
import { TreeSelectModule } from 'primeng/treeselect';
import { TreeModule } from "primeng/tree";
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TreeTableModule } from 'primeng/treetable';
import { MenubarModule } from 'primeng/menubar';

describe('HomeComponent', () => {
  beforeEach(async () => {

    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      providers: [MenuService, NodeService, HttpClient, HttpHandler],
      imports: [SpeedDialModule, TreeSelectModule, TreeModule, BreadcrumbModule, TreeTableModule, MenubarModule] // Add the provider here
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});







