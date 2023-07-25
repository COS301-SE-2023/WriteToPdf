import { Injectable } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Injectable({
  providedIn: 'root'
})
export class LoadingSpinnerService {
  private dialogRef: DynamicDialogRef | null = null;
  constructor(private dialogService: DialogService) {}
  show() {
    this.dialogRef = this.dialogService.open(LoadingSpinnerComponent, {
      closable: false,
      showHeader: false,
      modal: true,
      width: '100px',
      height: '100px'
    });
  }
  hide() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
