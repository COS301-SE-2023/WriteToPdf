import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { EditAssetComponent } from './edit-asset.component';

describe('EditAssetComponent', () => {
  let component: EditAssetComponent;
  let fixture: ComponentFixture<EditAssetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditAssetComponent]
    });
    fixture = TestBed.createComponent(EditAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
