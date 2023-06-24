import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadPopupComponent } from './file-upload-popup.component';

describe('FileUploadPopupComponent', () => {
  let component: FileUploadPopupComponent;
  let fixture: ComponentFixture<FileUploadPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FileUploadPopupComponent]
    });
    fixture = TestBed.createComponent(FileUploadPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
