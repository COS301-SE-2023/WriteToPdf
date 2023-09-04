import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Clipboard } from "@angular/cdk/clipboard";
import { AssetService } from '../services/asset.service';
import {OCRDialogService} from "../services/ocr-popup.service";

@Component({
  selector: 'app-ocr-popup',
  templateUrl: './ocr-popup.component.html',
  styleUrls: ['./ocr-popup.component.scss'],
})
export class OcrPopupComponent {
  JSONResponse: any = JSON;
  products: any[] = [
    {
      code: 'P1',
      inventoryStatus: 'INSTOCK',
      name: 'Product 1',
      price: 100,
    },
    {
      code: 'P2',
      inventoryStatus: 'INSTOCK',
      name: 'Product 2',
      price: 100,
    },
    {
      code: 'P3',
      inventoryStatus: 'INSTOCK',
      name: 'Product 3',
      price: 100,
    },
    {
      code: 'P1',
      inventoryStatus: 'INSTOCK',
      name: 'Product 4',
      price: 100,
    },
    {
      code: 'P1',
      inventoryStatus: 'INSTOCK',
      name: 'Product 5',
      price: 100,
    },];
  paragraphText: string = ''; // Use this property to bind to the textarea

  constructor(private dialog: OCRDialogService, private clipboard: Clipboard) {}

  copyFormDataAndRenderToHtml(): void {
    let retrievedAsset = this.dialog.passedOverAsset;
    this.clipboard.copy(this.paragraphText);
    console.log(retrievedAsset.JSONResponse);
  }

  constructTableHtml(): void {
    let tableHtml = '<table>\n';
    this.clipboard.copy(tableHtml);
    console.log(tableHtml);
  }

  closeDialog(): void {
    this.dialog.closeDialog()
  }





}
