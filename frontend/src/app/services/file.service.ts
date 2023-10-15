import { Injectable } from '@angular/core';
import { MarkdownFileDTO } from './dto/markdown_file.dto';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from './user.service';
import { EditService } from './edit.service';
import { DirectoryFilesDTO } from './dto/directory_files.dto';
import { ImportDTO } from './dto/import.dto';
import { ShareRequestDTO } from './dto/share_request.dto';
import * as murmurhash3 from 'murmurhash3js-revisited';
import { MessageService } from 'primeng/api';
import { environment } from "../../environments/environment";
import * as CryptoJS from 'crypto-js';
// import * as NodeRSA from 'node-rsa';
// import * as forge from 'node-forge';
import * as EC from 'elliptic';

import { ConversionService } from './conversion.service';
import { env } from 'process';
import { SignatureDTO } from './dto/signature.dto';

@Injectable({
  providedIn: 'root',
})
export class FileService {
ellipticCurve = new EC.ec('secp256k1');

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private editService: EditService,
    private messageService: MessageService,
    private conversionService: ConversionService
  ) {}

  // User does not need to provide userDocumentPassword (SafeLock)
  saveDocument(
    content: string | undefined,
    markdownID: string | undefined,
    path: string | undefined,
    safeLock: boolean | undefined
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendSaveData(content, markdownID, path, safeLock).subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  // User does not need to provide userDocumentPassword (SafeLock)
  sendSaveData(
    content: string | undefined,
    markdownID: string | undefined,
    path: string | undefined,
    safeLock: boolean | undefined
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/save_file`;
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.Content = this.encryptDocument(content);
    body.MarkdownID = markdownID;
    body.Path = path;
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  // User does not need to provide userDocumentPassword (SafeLock)
  async retrieveDocument(
    markdownID: string | undefined,
    path: string | undefined
  ): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.sendRetrieveData(markdownID, path).subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            resolve(this.decryptDocument(response.body.Content));
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'File could not be retrieved',
            });
            resolve(false);
          }
        },
      });
    });
  }

  // User does not need to provide userDocumentPassword (SafeLock)
  sendRetrieveData(
    markdownID: string | undefined,
    path: string | undefined
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/retrieve_file`;
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.MarkdownID = markdownID;
    body.Path = path;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  // User must provide userDocumentPassword (SafeLock) IF
  // they chose to lock the document
  createDocument(
    name: string,
    path: string | undefined,
    parentFolderID: string | undefined
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendCreateData(name, path, parentFolderID).subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'File created successfully',
            });

            this.editService.setAll(
              '',
              response.body.MarkdownID,
              response.body.Name,
              response.body.Path,
              response.body.ParentFolderID,
              response.body.SafeLock,
              ''
            );

            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  // User must provide userDocumentPassword (SafeLock) IF
  // they chose to lock the document
  sendCreateData(
    name: string,
    path: string | undefined,
    parentFolderID: string | undefined
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/create_file`;
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.Path = path;
    body.Name = name;
    body.ParentFolderID = parentFolderID;
    body.SafeLock = false;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  // User must provide userDocumentPassword (SafeLock) IF
  // the document is in SafeLock mode
  deleteDocument(markdownID: string | undefined): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendDeleteData(markdownID).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log(response);
          if (response.status === 200) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  // User must provide userDocumentPassword (SafeLock) IF
  // the document is in SafeLock mode
  sendDeleteData(
    markdownID: string | undefined
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/delete_file`;
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.Path = '';
    body.MarkdownID = markdownID;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  // User does not need to provide userDocumentPassword (SafeLock)
  renameDocument(
    markdownFileID: string | undefined,
    fileName: string | undefined,
    path: string | undefined
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendRenameData(markdownFileID, fileName, path).subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'File renamed successfully',
            });
            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  sendRenameData(
    markdownFileID: string | undefined,
    name: string | undefined,
    path: string | undefined
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/rename_file`;
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.MarkdownID = markdownFileID;
    body.Path = path;
    body.Name = name;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  // User does not need to provide userDocumentPassword (SafeLock)
  // because moving does not modify or compromise the document content
  moveDocument(
    markdownID: string | undefined,
    path: string | undefined,
    parentFolderID: string | undefined
  ): Promise<MarkdownFileDTO> {
    // Will need to rerun directory structure function with new moved file.
    return new Promise<MarkdownFileDTO>((resolve, reject) => {
      this.sendMoveData(markdownID, path, parentFolderID).subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'File moved successfully',
            });
            const markdownFile = new MarkdownFileDTO();
            markdownFile.MarkdownID = response.body.MarkdownID;
            markdownFile.Name = response.body.Name;
            markdownFile.Path = response.body.Path;
            markdownFile.ParentFolderID = response.body.ParentFolderID;
            markdownFile.SafeLock = response.body.SafeLock;
            markdownFile.DateCreated = response.body.DateCreated;
            resolve(markdownFile);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'File move failed',
            });
            reject();
          }
        },
      });
    });
  }

  // User does not need to provide userDocumentPassword (SafeLock)
  // because moving does not modify or compromise the document content
  sendMoveData(
    markdownID: string | undefined,
    path: string | undefined,
    parentFolderID: string | undefined
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/move_file`;
    const body = new MarkdownFileDTO();

    body.UserID = this.userService.getUserID();
    body.Path = path;
    body.MarkdownID = markdownID;
    body.ParentFolderID = parentFolderID;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  // User does not need to provide userDocumentPassword (SafeLock)
  retrieveAllFiles(): Promise<MarkdownFileDTO[]> {
    return new Promise<MarkdownFileDTO[]>((resolve, reject) => {
      this.sendRetrieveAllFiles().subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            const body = response.body;
            let files: MarkdownFileDTO[] = [];
            for (let i = 0; i < body.Files.length; i++) {
              const fileDTO = new MarkdownFileDTO();

              fileDTO.DateCreated = body.Files[i].DateCreated;
              fileDTO.LastModified = body.Files[i].LastModified;
              fileDTO.MarkdownID = body.Files[i].MarkdownID;
              fileDTO.Name = body.Files[i].Name;
              fileDTO.ParentFolderID = body.Files[i].ParentFolderID;
              fileDTO.Path = body.Files[i].Path;
              fileDTO.Size = body.Files[i].Size;
              fileDTO.SafeLock = body.Files[i].SafeLock;

              files.push(fileDTO);
            }
            resolve(files);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'File retrieval failed',
            });
            reject();
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'File retrieval failed',
          });
          reject();
        },
      });
    });
  }

  // User does not need to provide userDocumentPassword (SafeLock)
  sendRetrieveAllFiles(): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/retrieve_all_files`;
    const body = new DirectoryFilesDTO();

    body.UserID = this.userService.getUserID();

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  // User does not need to provide userDocumentPassword (SafeLock) because
  // a file on the local machine is not subject to SafeLock... for now
  importDocument(
    name: string,
    path: string,
    parentFolderID: string,
    content: string,
    type: string
  ): Promise<MarkdownFileDTO> {
    return new Promise<MarkdownFileDTO>((resolve, reject) => {
      this.sendImportData(name, path, parentFolderID, content, type).subscribe({
        next: (response: HttpResponse<any>) => {
          const outputFile = new MarkdownFileDTO();
          if (response.status === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'File imported successfully',
            });
            outputFile.Name = response.body.Name;
            outputFile.Path = response.body.Path;
            outputFile.ParentFolderID = response.body.ParentFolderID;
            outputFile.Content = this.decryptDocument(response.body.Content);
            outputFile.MarkdownID = response.body.MarkdownID;
            outputFile.Size = response.body.Size;
            outputFile.DateCreated = response.body.DateCreated;
            outputFile.LastModified = response.body.LastModified;
            resolve(outputFile);
          } else {
            resolve(outputFile);
          }
        },
      });
    });
  }

  // User does not need to provide userDocumentPassword (SafeLock) because
  // a file on the local machine is not subject to SafeLock... for now
  sendImportData(
    name: string,
    path: string,
    parentFolderID: string,
    content: string,
    type: string
  ): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/import`;
    const body = new ImportDTO();

    body.UserID = this.userService.getUserID();
    body.Path = path;
    body.Name = name;
    body.ParentFolderID = parentFolderID;
    body.Content = this.encryptDocument(content);
    body.Type = type;

    console.log('body', body);
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  // User does not need to provide userDocumentPassword (SafeLock)
  exportDocumentToNewFileType(
    markdownID: string | undefined,
    name: string,
    content: string,
    type: string | undefined
  ): void {
    //Applying CSS stylings to html page to allow for table conversion
    const txtContent = content;
    const tableStyling =
      'style="border-collapse: collapse; border:1px solid #bfbfbf;" ';
    const tdThStyling =
      'style="border: 1px solid #bfbfbf; padding: 8px; text-align: left; width:32px;" ';

    //more work needs to be done to get conversion better
    //NB Try to use document selector to select by class and apply all relevant styling
    //See conversion to JPEG and PNG for details
    content = content.replace(/<table/g, `<table ${tableStyling}`);
    content = content.replace(/<td/g, `<td ${tdThStyling}`);
    content = content.replace(/<th/g, `<th ${tdThStyling}`);

    content =
      `<head><style>
    .text-huge {font-size: 1.8em;}
    .text-big {font-size: 1.4em;}
    .text-small {font-size: 0.85em;}
    .text-tiny {font-size: 0.7em;}
    figure {display: block;margin-block-start: 1em;margin-block-end: 1em;margin-inline-start: 40px;margin-inline-end: 40px;}
    .table {display: table;margin: 0.9em auto;}
    </style></head>` + content;

    content = this.refactorHtmlForExport(content);

    let blob: Blob;
    let fileURL: string;
    let link: HTMLAnchorElement;

    switch (type) {
      case 'html':
        this.conversionService.downloadAsHtmlFile(content, name);

        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Export to html successful',
        });

        return;
      case 'pdf':
        this.conversionService.downloadAsPdfFile(content, name);

        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Export to pdf successful',
        });
        return;
      case 'txt':
        blob = this.conversionService.convertHtmlToPlainText(txtContent, type);

        // Download the File
        fileURL = URL.createObjectURL(blob);
        link = document.createElement('a');
        link.href = fileURL;
        link.download = name + '.' + type;
        link.click();
        URL.revokeObjectURL(fileURL);

        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Export to txt successful',
        });

        return;
      case 'md':
        blob = this.conversionService.convertHtmlToPlainText(txtContent, type);

        // Download the File
        fileURL = URL.createObjectURL(blob);
        link = document.createElement('a');
        link.href = fileURL;
        link.download = name + '.' + type;
        link.click();
        URL.revokeObjectURL(fileURL);

        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Export to md successful',
        });
        return;
      case 'jpeg':
        this.conversionService.convertHtmlToImage(content, name, type);
        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Export to jpeg successful',
        });
        return;
      case 'png':
        this.conversionService.convertHtmlToImage(content, name, type);
        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Export to png successful',
        });
        return;
    }
    this.messageService.add({
      severity: 'error',
      summary: 'Export failed',
    });

    // if (type === 'html') {
    //   this.downloadAsHtmlFile(content, name);
    //   return;
    // }
    // this.sendExportData(markdownID, name, content, type).subscribe({
    //   next: (response: HttpResponse<any>) => {
    //     if (response.status === 200) {
    //       const fileData: number[] = response.body.data;
    //       const uint8Array = new Uint8Array(fileData);
    //       const blob = new Blob([uint8Array], { type: 'application/pdf' });

    //       // Download the File
    //       const fileURL = URL.createObjectURL(blob);
    //       const link = document.createElement('a');
    //       link.href = fileURL;
    //       link.download = name + '.' + type;
    //       link.click();
    //       URL.revokeObjectURL(fileURL);

    //       // Show success message
    //       this.messageService.add({
    //         severity: 'success',
    //         summary: 'Export successful',
    //       });
    //     } else {
    //       this.messageService.add({
    //         severity: 'error',
    //         summary: 'Export failed',
    //       });
    //     }
    //   },
    // });
  }

  updateLockDocument(
    markdownID: string,
    content: string,
    userDocumentPassword: string,
    safeLock: boolean,
    path: string
  ): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      (await this.sendUpdateLockData(
        markdownID,
        content,
        userDocumentPassword,
        safeLock,
        path
      )).subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 200) {
            if (safeLock) {
              this.messageService.add({
                severity: 'success',
                summary: 'File locked successfully',
              });
            } else {
              this.messageService.add({
                severity: 'success',
                summary: 'File unlocked successfully',
              });
            }
            resolve(true);
          } else {
            resolve(false);
          }
        },
      });
    });
  }

  async sendUpdateLockData(
    markdownID: string,
    content: string,
    userDocumentPassword: string,
    safeLock: boolean,
    path: string
  ): Promise<Observable<HttpResponse<any>>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/update_safelock_status`;
    const body = new MarkdownFileDTO();
    body.UserID = this.userService.getUserID();
    body.MarkdownID = markdownID;
    if (safeLock) {
      body.Content = this.encryptSafeLockDocument(
        content,
        userDocumentPassword
      );

      new Promise<boolean>((resolve, reject) => {
        this.sendSaveData(body.Content, markdownID, path, safeLock).subscribe({
          next: (response: HttpResponse<any>) => {},
        });
      });
    } else {
      const decrypted = await this.decryptSafeLockDocument(
        content,
        userDocumentPassword
      );
      if (decrypted === null) {
        this.messageService.add({
          severity: 'error',
          summary: 'Incorrect password',
        });
        return new Observable<HttpResponse<any>>();
              }
      body.Content = decrypted;

      new Promise<boolean>((resolve, reject) => {
        this.sendSaveData(body.Content, markdownID, path, safeLock).subscribe({
          next: (response: HttpResponse<any>) => {},
        });
      });
    }
    body.SafeLock = safeLock;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  encryptDocument(content: string | undefined): string {
    if (content) return content;
    const key = this.userService.getEncryptionKey();
    if (key && content) {
      const encryptedMessage = CryptoJS.AES.encrypt(content, key).toString();
      return encryptedMessage;
    } else {
      return '';
    }
  }

// Function to verify the encrypted signature using ECDSA with public key
verifySignature(
  encryptedSignature: string,
  matchingSignature: string
): boolean {
  const PUBLIC_KEY = environment.PUBLIC_KEY;
  // Convert the hex-encoded public key to a key instance
  const key = this.ellipticCurve.keyFromPublic(PUBLIC_KEY, 'hex');
  return key.verify(matchingSignature, encryptedSignature);
}

  generateSignature(content: string) {
    const signatureDTO = new SignatureDTO();
    signatureDTO.Signature = this.calculateMurmurHash3(content).toString();
    signatureDTO.UserID = this.userService.getUserID();
    signatureDTO.MarkdownID = this.editService.getMarkdownID();
    //TODO send request to backend to sign the signature, then return the signed signature from the backend's dto
    return signatureDTO.SignedSignature;
  }
    // Function to calculate the MurmurHash3 for a string
 calculateMurmurHash3(content: string): number {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hash = murmurhash3.x86.hash32(data);
  return hash;
}

  generateKey(password: string) {
    return CryptoJS.PBKDF2(password, '', {
      keySize: 256 / 32, // 256 bits for the key
      iterations: 50000 // iterations for the key
    }).toString();
  }

  encryptSafeLockDocument(
    content: string | undefined,
    userDocumentPassword: string
  ) {
    const delimiter = '!@#$%^&*DELIMITER*^&%$#@!';
    if (userDocumentPassword && (content || content == '')) {
      const signature = this.generateSignature(content);
      const key = this.generateKey(userDocumentPassword);
      content = content + delimiter + signature;
      const encryptedMessage = CryptoJS.AES.encrypt(content, key).toString();
      return encryptedMessage;
    } else {
      return '';
    }
  }

  decryptDocument(content: string | undefined): string {
    if (content) return content;
    const key = this.userService.getEncryptionKey();
    if (key && content) {
      const decryptedMessage = CryptoJS.AES.decrypt(content, key)
        .toString(CryptoJS.enc.Utf8)
        .replace(/^"(.*)"$/, '$1');
      return decryptedMessage;
    } else {
      return '';
    }
  }

  getSignature(content:string, delimiter: string){
    const signature = content.substring(
      content.length - ((content.split(delimiter).pop() || '').length || 0),
      content.length
    );
    return signature;
  }

  removeSignature(content:string | undefined, delimiter: string){
    if (!content) return '';
    const signRemoved = content.substring(
      0,
      content.length - delimiter.length - ((content.split(delimiter).pop() || '').length || 0)
    );
    return signRemoved;
  }

  decryptSafeLockDocument(
    content: string | undefined,
    userDocumentPassword: string
  ): string | null {
    if (userDocumentPassword && (content || content == '')) {
      try{
        const key = this.generateKey(userDocumentPassword);
        const decryptedMessageBeforeReplace = CryptoJS.AES.decrypt(content, key)
          .toString(CryptoJS.enc.Utf8);
          const decryptedMessage = decryptedMessageBeforeReplace.replace(/^"(.*)"$/, '$1');
          // const signature = this.generateSignature(userDocumentPassword);
          const delimiter = '!@#$%^&*DELIMITER*^&%$#@!';

          const receivedSignature = this.getSignature(decryptedMessage, delimiter);
          const receivedContent = this.removeSignature(decryptedMessage, delimiter);
          const signature = this.generateSignature(receivedContent);
          console.log("Received Signature: ", receivedSignature);
          console.log("Expected signature: ", signature);
          console.log("Received content: ", receivedContent);
          console.log('Verify signature: ', this.verifySignature(receivedSignature, signature || ''));
          if (this.verifySignature(receivedSignature, signature || '')) {
            console.log("Matches");
            return receivedContent;
          } else {
            return null;
          }
      } catch (error) {
        return null;
      }
    } else {
      return null;
    }
  }

  shareDocument(markdownID:string, recipientEmail:string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.sendShareData(markdownID, recipientEmail).subscribe({
        next: (response: HttpResponse<any>) => {
          console.log("Non error: ",response);
          if (response.status === 200) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        error: (error) => {
          console.log("Failed: ",error);
          this.messageService.add({
            severity: 'error',
            summary: error.error.error || error.error.message || 'File sharing failed',
          });
          resolve(false);
        }
      });
    });
  }

  sendShareData(markdownID:string, recipientEmail:string): Observable<HttpResponse<any>> {
    const environmentURL = environment.apiURL;
    const url = `${environmentURL}file_manager/share`;
    const body = new ShareRequestDTO();

    body.UserID = this.userService.getUserID();
    body.MarkdownID = markdownID;
    body.RecipientEmail = recipientEmail;

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.userService.getAuthToken()
    );
    return this.http.post(url, body, { headers, observe: 'response' });
  }

  refactorHtmlForExport(content: string): string {
    // Create a temporary container element to parse the HTML string
    const container = document.createElement('div');
    container.innerHTML = content;
  
    // Find all <figure> elements within the container
    const figureElements = container.querySelectorAll('figure');
  
    // Loop through each <figure> element and apply its width to the nested <img> element
    figureElements.forEach((figureElement) => {
      const figureStyle = figureElement.getAttribute('style');
      const imgElement = figureElement.querySelector('img');
  
      if (imgElement && figureStyle) {
        imgElement.style.width = figureStyle.match(/width:\s*(\d+px)/)?.[1] || '';
      }
    });

    return container.innerHTML;
  }
}
