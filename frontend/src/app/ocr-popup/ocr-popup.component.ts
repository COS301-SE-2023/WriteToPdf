import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-ocr-popup',
  templateUrl: './ocr-popup.component.html',
  styleUrls: ['./ocr-popup.component.scss']
})
export class OcrPopupComponent {
  paragraphText: string = ''; // Use this property to bind to the textarea
  tableData: any[] = [
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Jane Smith', email: 'jane@example.com' },
    // Add more rows as needed
  ];
  constructor(private dialog: MatDialog) {}

  closeDialog(): void {
    this.dialog.closeAll();
  }
}
