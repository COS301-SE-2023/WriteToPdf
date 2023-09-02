import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Clipboard } from "@angular/cdk/clipboard";

@Component({
  selector: 'app-ocr-popup',
  templateUrl: './ocr-popup.component.html',
  styleUrls: ['./ocr-popup.component.scss'],
})
export class OcrPopupComponent {
  @ViewChild('myTable') tableRef!: ElementRef;
  renderTableEditableBool: boolean = false;
  tableData: any[] = [
    {"name": "John Smith", "occupation": "Advisor", "age": 36},
    {"name": "Muhi Masri", "occupation": "Developer", "age": 28},
    {"name": "Peter Adams", "occupation": "HR", "age": 20},
    {"name": "Lora Bay", "occupation": "Marketing", "age": 43}
  ];
  COLUMNS_SCHEMA = [
    {
      key: "name",
      type: "text",
      label: "Full Name"
    },
    {
      key: "occupation",
      type: "text",
      label: "Occupation"
    },
    {
      key: "age",
      type: "number",
      label: "Age"
    },
  ]
  displayedColumns: string[] = ['name', 'occupation', 'age'];
  dataSource: any = this.tableData;
  columnsSchema: any = this.COLUMNS_SCHEMA;
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

  constructor(private dialog: MatDialog, private clipboard: Clipboard) {}

  renderTableEditable(): void {
    this.renderTableEditableBool = !this.renderTableEditableBool;
    this.tableData.forEach((row) => (row.isEdit = this.renderTableEditableBool));

  }

  copyFormData(): void {
    this.clipboard.copy(this.paragraphText);
  }

  copyTableHtml(): void {
    const tableHtml = this.tableRef.nativeElement.outerHTML;
    this.clipboard.copy(tableHtml);
    console.log(tableHtml);
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }
}
