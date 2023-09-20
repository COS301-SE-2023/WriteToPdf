import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OcrPopupComponent } from '../ocr-popup/ocr-popup.component';
@Injectable({
    providedIn: 'root',
})
export class OCRDialogService {
    passedOverAsset: any;
    baseDialogZindex = 1000;
  constructor(private dialog: MatDialog) {}
    CheckDialogOpen(): boolean {
        return this.dialog.openDialogs.length > 0;
    }
    openDialog(data?: any): void {
        if (!this.CheckDialogOpen()) {
            const ref = this.dialog.open(OcrPopupComponent, {
                height: '580px',
                width: '75%',
                position: {
                    top: '12%',
                    left: '17%',
                },
                data: data
            });
          ref.afterOpened().subscribe(_ => {
            this.addZIndex(ref);
          });
        } else {
            this.closeDialog();
        }

    }

  addZIndex(dialogRef: MatDialogRef<OcrPopupComponent>) {
    if (dialogRef.componentInstance.dialogContainer.style.zIndex !== this.baseDialogZindex.toString()) {
      this.baseDialogZindex += 1;
      dialogRef.componentInstance.dialogContainer.style.zIndex = this.baseDialogZindex.toString();
    }
  }

    retrievePassedOverAsset(): any {
      return this.passedOverAsset;
    }
    closeDialog(): void {
        this.dialog.closeAll();
    }
}
