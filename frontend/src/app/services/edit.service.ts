import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class EditService {
  private content: string | undefined = '';
  private markdownID: string | undefined = '';
  private name: string | undefined = '';
  private path: string | undefined = '';
  private parentFolderID: string | undefined = '';
  private safeLock: boolean | undefined = false;
  private documentPassword: string | undefined = '';

  constructor(private userService: UserService) {}

  setContent(content: string | undefined) {
    this.content = content;
    if(this.content == undefined) {
      this.content = '';
    }
    localStorage.setItem('content', this.content);
  }

  getContent(): string | undefined {
    return this.content;
  }

  setMarkdownID(markdownID: string | undefined) {
    this.markdownID = markdownID;
    if(this.markdownID == undefined) {
      this.markdownID = '';
    }
    localStorage.setItem('markdownID', this.markdownID);
  }

  getMarkdownID(): string | undefined {
    return this.markdownID;
  }

  setName(name: string | undefined) {
    this.name = name;
    if(this.name == undefined) {
      this.name = '';
    }
    localStorage.setItem('name', this.name);
  }

  getName(): string | undefined {
    return this.name;
  }

  setPath(path: string | undefined) {
    this.path = path;
    if(this.path == undefined) {
      this.path = '';
    }
    localStorage.setItem('path', this.path);
  }

  getPath(): string | undefined {
    return this.path;
  }

  setParentFolderID(parentFolderID: string | undefined) {
    this.parentFolderID = parentFolderID;
    if(this.parentFolderID == undefined) {
      this.parentFolderID = '';
    }
    localStorage.setItem('parentFolderID', this.parentFolderID);
  }

  getParentFolderID(): string | undefined {
    return this.parentFolderID;
  }

  getSafeLock(): boolean | undefined {
    return this.safeLock;
  }

  getDocumentPassword(): string | undefined {
    return this.documentPassword;
  }

  setAll(
    content: string | undefined,
    markdownID: string | undefined,
    name: string | undefined,
    path: string | undefined,
    parentFolderID: string | undefined,
    safeLock: boolean | undefined,
    documentPassword: string | undefined
  ) {
    this.content = content;
    this.markdownID = markdownID;
    this.name = name;
    this.path = path;
    this.parentFolderID = parentFolderID;
    this.safeLock = safeLock;
    this.documentPassword = documentPassword;

    if(this.content == undefined) {
      this.content = '';
    }
    if(this.markdownID == undefined) {
      this.markdownID = '';
    }
    if(this.name == undefined) {
      this.name = '';
    }
    if(this.path == undefined) {
      this.path = '';
    }
    if(this.parentFolderID == undefined) {
      this.parentFolderID = '';
    }
    if(this.safeLock == undefined) {
      this.safeLock = false;
    }
    if(documentPassword == undefined) {
      documentPassword = '';
    }

    localStorage.setItem('content', this.content);
    localStorage.setItem('markdownID', this.markdownID);
    localStorage.setItem('name', this.name);
    localStorage.setItem('path', this.path);
    localStorage.setItem('parentFolderID', this.parentFolderID);
    localStorage.setItem('safeLock', this.safeLock.toString());
    localStorage.setItem('encryptedDocumentPassword', this.encryptPassword(documentPassword));
  }

  reset() {
    this.content = '';
    this.markdownID = '';
    this.name = '';
    this.path = '';
    this.parentFolderID = '';
    this.safeLock = false;
    this.documentPassword = '';

    localStorage.setItem('content', this.content);
    localStorage.setItem('markdownID', this.markdownID);
    localStorage.setItem('name', this.name);
    localStorage.setItem('path', this.path);
    localStorage.setItem('parentFolderID', this.parentFolderID);
    localStorage.setItem('safeLock', this.safeLock.toString());
    localStorage.setItem('encryptedDocumentPassword', this.encryptPassword(this.documentPassword));

  }

  encryptPassword(content: string | undefined): string {
    const key = this.userService.getEncryptionKey();
    if (key && content) {
      const encryptedMessage = CryptoJS.AES.encrypt(content, key).toString();
      return encryptedMessage;
    } else {
      return '';
    }
  }

  decryptPassword(content: string | undefined): string {
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

}
