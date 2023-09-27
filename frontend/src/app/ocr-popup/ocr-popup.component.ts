import {Component, ElementRef, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Clipboard} from "@angular/cdk/clipboard";
import {OCRDialogService} from "../services/ocr-popup.service";
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";
import {MessageService} from 'primeng/api';

interface TableRow {
  [key: string]: string;
}

@Component({
  selector: 'app-ocr-popup',
  templateUrl: './ocr-popup.component.html',
  styleUrls: ['./ocr-popup.component.scss'],
})
export class OcrPopupComponent implements OnInit {
  activeTab: number = 0;
  activeTable: any = [];
  tableElements: any = [];
  assetObjectJSON: any = [];
  assetObject: any = [];
  convertedRenderableTables: any = [];
  assetImage: string = '';
  textElements: any = [];
  paragraphText: string = '';
  tableOptions: any = [];
  selectedTable: string = 'Table 1';
  public editor: DecoupledEditor;

  constructor(private dialog: OCRDialogService,
              private clipboard: Clipboard,
              private elementRef: ElementRef,
              private messageService: MessageService,
              @Inject(MAT_DIALOG_DATA) private passedOverAssetandEditor: any) {
    this.assetObject = this.passedOverAssetandEditor[0]
    this.editor = this.passedOverAssetandEditor[1];
  }

  get dialogContainer() {
    const elementRef = this.elementRef.nativeElement as HTMLElement;
    const dialogContainer = elementRef?.parentNode?.parentNode?.parentNode as HTMLElement;
    return dialogContainer;
  }

  getColumnKeys(row: any): string[] {
    return Object.keys(row);
  }


  ngOnInit() {
    this.assetObjectJSON = JSON.parse(this.assetObject.Content);
    this.assetImage = "data:image/png;base64," + this.assetObject.Image;
    for (let i = 0; i < this.assetObjectJSON.elements.length; i++) {
      if (this.assetObjectJSON.elements[i].hasOwnProperty("Text Element")) {
        this.textElements.push(this.assetObjectJSON.elements[i]["Text Element"] );
      }
    }

    this.paragraphText = '';
    for (let i = 0; i < this.textElements.length; i++) {
      this.paragraphText += this.textElements[i]["Lines"]+ "\n";
    }
    if (this.assetObjectJSON["Table Indices"].length != 0) {
      let eachIndex;
      for (eachIndex of this.assetObjectJSON["Table Indices"]) {
        // console.log("Table Element at index:", this.assetObjectJSON.elements[eachIndex]);
        this.tableElements.push(this.assetObjectJSON.elements[eachIndex]["Table Element"]);
      }
      for (let i = 0; i < this.tableElements.length; i++) {
        if (this.tableElements[i].hasOwnProperty("Table")) {
          let convertedStruc = this.convertToTableStructForPrimeNG(this.tableElements[i]);
          this.convertedRenderableTables.push(convertedStruc);
        }
      }
      for (let i = 0; i < this.convertedRenderableTables.length; i++) {
        this.tableOptions.push("Table " + (i + 1));
      }
      console.log("Rendered Tables:", this.convertedRenderableTables);
      this.activeTable = this.convertedRenderableTables[0];
      console.log(this.activeTable);
    }
  }

  copyHtmlToClipboard(html: string) {
    // Use the Clipboard API to copy the data to the clipboard
    navigator.clipboard
        .write([
          new ClipboardItem({
            'text/html': new Blob([html], {type: 'text/html'}),
          }),
        ])
        .then(
            () => {
            },
            (error) => {
              console.error(
                  'Could not copy HTML data (image) to clipboard: ',
                  error
              );
            }
        );
  }

  onTableSelectionChange() {
    setTimeout(() => {
      let tableIndex = parseInt(this.selectedTable.split(" ")[1]) - 1;
      this.activeTable = this.convertedRenderableTables[tableIndex];
    }, 0);
  }

  convertToTableStructForPrimeNG(tableElement: any): TableRow[] {
    if (tableElement != undefined) {
      const numRows = tableElement["rows"];
      const numCols = tableElement["cols"];
      const returnStruct: TableRow[] = [];

      for (let i = 0; i < numRows; i++) {
        const row: TableRow = {};
        for (let j = 0; j < numCols; j++) {
          const colKey = `col${j + 1}`;
          let cellVal = tableElement["Table"][i][j];
          row[colKey] = cellVal;
        }
        returnStruct.push(row);
      }

      return returnStruct;
    } else {
      return [];
    }
  }


  copyFormData(): void {
    this.clipboard.copy(this.paragraphText);
    this.messageService.add({
      severity: 'success',
      summary: 'Text Copied',
      detail: 'OCR Text has been copied to the clipboard.'
    });
  }


  copyCurrentTable(): void {
    let tableHtml = this.generateHtmlTable(this.activeTable);
    this.copyHtmlToClipboard(tableHtml);
    this.messageService.add({
      severity: 'success',
      summary: 'Table Copied',
      detail: 'Table has been copied to the clipboard'
    });
  }

  copyAllTables(): void {
    let tableHtmls = [];
    for (let i = 0; i < this.convertedRenderableTables.length; i++) {
      tableHtmls.push(this.generateHtmlTable(this.convertedRenderableTables[i]));
    }
    let updatedData = '';
    for (let i = 0; i < tableHtmls.length; i++) {
      updatedData += '<p>\n</p>' + tableHtmls[i] + '<p>\n</p>';
    }
    this.copyHtmlToClipboard(updatedData);
    this.messageService.add({
      severity: 'success',
      summary: 'Tables Copied',
      detail: 'All tables have been copied onto the clipboard'
    });
  }

  generateHtmlTable(tableData: any[]): string {
    if (!tableData || tableData.length === 0) {
      return ''; // Return an empty string if the table data is empty or undefined
    }

    // Generate the table rows
    let tableHtml = '<table border="1"><tbody>';
    tableData.forEach((row) => {
      tableHtml += '<tr>';
      Object.keys(row).forEach((key) => {
        tableHtml += `<td>${row[key]}</td>`;
      });
      tableHtml += '</tr>';
    });

    tableHtml += '</tbody></table>';
    return tableHtml;
  }

  closeDialog(): void {
    this.dialog.closeDialog()
  }


}
