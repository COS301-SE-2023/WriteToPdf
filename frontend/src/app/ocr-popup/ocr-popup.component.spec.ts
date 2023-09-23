import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OcrPopupComponent } from './ocr-popup.component';

describe('OcrPopupComponent', () => {
  let component: OcrPopupComponent;
  let fixture: ComponentFixture<OcrPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OcrPopupComponent]
    });
    fixture = TestBed.createComponent(OcrPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
