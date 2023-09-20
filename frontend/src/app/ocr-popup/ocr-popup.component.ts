import {Component, ElementRef, Inject, Renderer2, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Clipboard} from "@angular/cdk/clipboard";
import {OCRDialogService} from "../services/ocr-popup.service";


@Component({
    selector: 'app-ocr-popup',
    templateUrl: './ocr-popup.component.html',
    styleUrls: ['./ocr-popup.component.scss'],
})
export class OcrPopupComponent implements OnInit {
    activeTab: number = 0;
    tableIndices: any = [];
    tableElements: any = [];
    assetObjectJSON: any = [];
    assetObject: any = [];
    convertedRenderableTables: any = [];
    assetImage: string ='';
    textElements: any = [];
    paragraphText: string = '';
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
    },];// Use this property to bind to the textarea
    dummyJSON: any = {
        "Num Elements": 2,
        "Table Indices": 1,
        "elements": [
            {
                "Text Element": {
                    "Lines": [
                        "Sample Vaccination Record Card",
                        "Mary\tMajor\tM",
                        "Last Name\tFirst Name\tMI",
                        "1/6/58\t012345abcd67",
                        "Date of Birth\tPatient number (medical record or IIS record number)"
                    ]
                }
            },
            {
                "Table Element": {
                    "Num Rows": 5,
                    "Num Cols": 4,
                    "Table": [
                        [
                            "Vaccine",
                            "Product Name/Manufacturer Lot Number",
                            "Date",
                            "Healthcare Professional or Clinic Site"
                        ],
                        [
                            "1st Dose Vaccine A",
                            "AA1234 Pfizer",
                            "1/18/21 mm dd yy",
                            "XYZ"
                        ],
                        [
                            "2nd Dose Vaccine A",
                            "Pfizer 2/8/2021 CVS BB5678",
                            "/ / mm dd yy"
                        ],
                        [
                            "Booster Shot Vaccine A",
                            " ",
                            "/ / mm dd yy"
                        ],
                        [
                            "Other",
                            " ",
                            "/ / mm dd yy"
                        ]
                    ]
                }
            }
        ]
    };

    constructor(private dialog: OCRDialogService,
                private clipboard: Clipboard,
                private elementRef: ElementRef,
                private renderer: Renderer2,
                @Inject(MAT_DIALOG_DATA) private passedOverAsset: any) {
      this.assetObject = this.passedOverAsset;
    }

  get dialogContainer() {
    const elementRef = this.elementRef.nativeElement as HTMLElement;
    const dialogContainer = elementRef?.parentNode?.parentNode?.parentNode as HTMLElement;
    return dialogContainer;
  }


  ngOnInit() {
      this.assetObjectJSON = JSON.parse(this.assetObject.Content);
      console.log("Parsed JSON:", this.assetObjectJSON);
      this.assetImage = "data:image/png;base64," + this.assetObject.Image;
        for (let i = 0; i < this.assetObjectJSON.elements.length; i++) {
            if (this.assetObjectJSON.elements[i].hasOwnProperty("Text Element")) {
                this.textElements.push(this.assetObjectJSON.elements[i]["Text Element"]);
            }
        }
        if(this.assetObjectJSON["Table Indices"].length !=0) {
            let eachIndex;
            for (eachIndex of this.assetObjectJSON["Table Indices"]) {
                this.tableElements.push(this.assetObjectJSON.elements["elements"][eachIndex]["Table Element"]);
            }
        }
        this.paragraphText = '';
        for (let i = 0; i < this.textElements.length; i++) {
            this.paragraphText += this.textElements[i]["Lines"];
        }
        for (let i = 0 ; this.tableElements.length; i++){
          this.convertedRenderableTables.push(this.convertToTableStructForPrimeNG(this.tableElements[i]));
        }
        console.log(this.convertedRenderableTables);
    }

  convertToTableStructForPrimeNG(tableElement: any): any {
    console.log(tableElement);
    console.log(typeof tableElement);
    const numRows = tableElement["Num Rows"];
    const numCols = tableElement["Num Cols"];
    const returnStruct = [];
    let row = [];
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        // Generate column key, e.g., "col1", "col2", ...
        const colKey = `col${j + 1}`;
        let cellVal = tableElement["Table"][i][j];
        row.push({[colKey]:cellVal});
      }
      returnStruct.push(row);
    }
    return returnStruct;

  }

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
