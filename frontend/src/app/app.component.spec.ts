import 'zone.js/dist/zone.js';
import 'zone.js/dist/zone-testing.js'; // Must add both these imports
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { expect } from '@jest/globals';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { TestComponentRenderer } from '@angular/core/testing';

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.initTestEnvironment(
      [RouterTestingModule],
      platformBrowserDynamicTesting()
    );
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, BrowserModule],
      declarations: [AppComponent],
      providers: [TestComponentRenderer],
    }).compileComponents(); // These options are where the magic happens
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'WriteToPdf'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('WriteToPdf');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain(
      'WriteToPdf app is running!'
    );
  });
});
