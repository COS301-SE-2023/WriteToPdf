import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {OcrPopupComponent} from "./ocr-popup.component";

@Injectable({
    providedIn: 'root',
})
export class OCRDialogService {
    constructor(private dialog: MatDialog) {}
    openDialog(): void {
        this.dialog.open(OcrPopupComponent, {
            height: '55vh',
            width: '55%',
            position: {
                top: '12%',
                left: '26%',
            },
        });
    }
    closeDialog(): void {
        this.dialog.closeAll();
    }
}
