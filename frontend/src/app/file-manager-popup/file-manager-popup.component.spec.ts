import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileManagerPopupComponent } from './file-manager-popup.component';

describe('FileManagerPopupComponent', () => {
  let component: FileManagerPopupComponent;
  let fixture: ComponentFixture<FileManagerPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FileManagerPopupComponent]
    });
    fixture = TestBed.createComponent(FileManagerPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
