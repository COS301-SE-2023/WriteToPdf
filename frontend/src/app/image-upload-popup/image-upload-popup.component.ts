import { Component, Input } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FileService } from '../services/file.service';
import { NodeService } from '../services/home.service';
import { EditService } from '../services/edit.service';
import { Router } from '@angular/router';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Inject } from '@angular/core';
import { AssetService } from '../services/asset.service';

@Component({
  selector: 'app-image-upload-popup',
  templateUrl: './image-upload-popup.component.html',
  styleUrls: ['./image-upload-popup.component.scss'],
})
export class ImageUploadPopupComponent {
  uploadedFiles: any[] = [];
  fromEditPage: boolean = false;
  uploadedImage: File | null = null;
  fromHomepage: boolean = false;
  extractText: boolean = false; // Boolean variable to track text extraction option
  extractTable: boolean = false; // Boolean variable to track table extraction option

  @Input() acceptedTypes = '.jpeg, .jpg, .png';

  constructor(
    private dialogRef: DynamicDialogRef,
    private messageService: MessageService,
    private fileService: FileService,
    private nodeService: NodeService,
    private editService: EditService,
    private assetService: AssetService,
    @Inject(Router) private router: Router
  ) { }

  handleExtractTableChange() {
    // If the Extract Table checkbox is checked, check both checkboxes and disable the Extract Text checkbox
    if (this.extractTable) {
      this.extractText = true;
    } else {
      // If the Extract Table checkbox is unchecked, re-enable the Extract Text checkbox
      this.extractText = false;
    }
  }

  onUpload(event: any) {
    const file = event.files[0]; // Get the first selected file
    this.uploadedFiles = [file]; // Update the uploadedFiles array with the selected file
    const reader = new FileReader();
    this.uploadedFiles.push(file);
    reader.onload = (e: any) => {
      const fileContent = reader.result as string;
      const name = file.name.split('.')[0];
      const type = file.name.split('.')[1];

      let path = this.editService.getPath();
      if (!this.editService.getPath())
        path = '';

      let parentFolderId = this.editService.getParentFolderID();
      if (!this.editService.getParentFolderID())
        parentFolderId = '';

      let format = 'image';
      if (this.extractText && !this.extractTable) {
        format = 'text';
      }
      else if(this.extractTable){
        format = 'table';
      }
      this.assetService
        .uploadImage(
          fileContent,
          path,
          name,
          parentFolderId,
          format
        );
    };
    reader.readAsDataURL(file);

    this.messageService.add({
      severity: 'info',
      summary: 'Image Uploaded',
      detail: '',
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  navigateToPage(pageName: string): void {
    this.router.navigate([`${pageName}`]);
  }
}
