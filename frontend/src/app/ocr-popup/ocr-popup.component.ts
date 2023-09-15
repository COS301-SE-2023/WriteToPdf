import {Component, ElementRef, Inject, Renderer2} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Clipboard} from "@angular/cdk/clipboard";
import {OCRDialogService} from "../services/ocr-popup.service";

@Component({
    selector: 'app-ocr-popup',
    templateUrl: './ocr-popup.component.html',
    styleUrls: ['./ocr-popup.component.scss'],
})
export class OcrPopupComponent {
    activeTab: number = 0;
    ocrJSONResponse: any = JSON;
    paragraphText: string = ''; // Use this property to bind to the textarea

    constructor(private dialog: OCRDialogService,
                private clipboard: Clipboard,
                private elementRef: ElementRef,
                private renderer: Renderer2,
                @Inject(MAT_DIALOG_DATA) private ocrData: any) {
      this.ocrData = this.ocrJSONResponse;
    }
    //TODO - Refine the two functions below in accordance with Janco's JSON response.
    checkIfTableDataExists(): boolean {
        return this.ocrData.tableData !== undefined;
    }
    checkIfParagraphDataExists(): boolean {
        return this.ocrData.paragraphData !== undefined;
    }

    //TODO - Be sure to parse the ocrData to the relevant components
    // i.e. the table data to the table component, the paragraph data to the paragraph component
    copyFormDataAndRenderToHtml(): void {
        let retrievedAsset = this.dialog.passedOverAsset;
        this.clipboard.copy(this.paragraphText);
        // console.log(retrievedAsset.ocrJSONResponse);
    }

    injectHtmlIntoTable(tableData: any) {
        // Get the table element
        const tableElement = this.elementRef.nativeElement.querySelector('.tableCreated');
        // Iterate through the 2D array
        for (let rowIndex = 0; rowIndex < tableData.length; rowIndex++) {
            // Create a new row
            const trElement = this.renderer.createElement('tr');
            for (let colIndex = 0; colIndex < tableData[rowIndex].length; colIndex++) {
                // Create a new cell (td) for each column
                const tdElement = this.renderer.createElement('td');
                // Create the inner HTML structure with ng-templates
                tdElement.innerHTML = `
                        <td [pEditableColumn]="dataEntry" pEditableColumnField="dataEntry">
                          <p-cellEditor>
                            <ng-template pTemplate="input">
                              <input [(ngModel)]="dataEntry" pInputText type="text"/>
                            </ng-template>
                            <ng-template pTemplate="output">
                              {{ dataEntry }}
                            </ng-template>
                          </p-cellEditor>
                        </td>
                      `.replace(/dataEntry/g, tableData[rowIndex][colIndex]);
                      // Append the cell to the row
                this.renderer.appendChild(trElement, tdElement);
            }
            // Append the row to the table
            this.renderer.appendChild(tableElement, trElement);
        }
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
