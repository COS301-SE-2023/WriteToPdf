import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {OcrPopupComponent} from "../ocr-popup/ocr-popup.component";

@Injectable({
    providedIn: 'root',
})
export class OCRDialogService {
    passedOverAsset: any;
    constructor(private dialog: MatDialog) {}
    CheckDialogOpen(): boolean {
        return this.dialog.openDialogs.length > 0;
    }
    openDialog(passedOverAsset: any): void {
      this.passedOverAsset = passedOverAsset;
      if(!this.CheckDialogOpen()) {
        this.dialog.open(OcrPopupComponent, {
          height: '500px',
          width: '75%',
          position: {
            top: '12%',
            left: '17%',
          },
        });
      } else {
        this.closeDialog();
      }
    }
    retrievePassedOverAsset(): any {
      return this.passedOverAsset;
    }
    closeDialog(): void {
        this.dialog.closeAll();
    }
}
