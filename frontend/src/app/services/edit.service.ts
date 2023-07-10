import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EditService {
  private content: string | undefined = '';
  private markdownID: string | undefined = '';
  private name: string | undefined = '';
  private path: string | undefined = '';
  private parentFolderID: string | undefined = '';

  constructor() {}

  setContent(content: string | undefined) {
    this.content = content;
  }

  getContent(): string | undefined {
    return this.content;
  }

  setMarkdownID(markdownID: string | undefined) {
    this.markdownID = markdownID;
  }

  getMarkdownID(): string | undefined {
    return this.markdownID;
  }

  setName(name: string | undefined) {
    this.name = name;
  }

  getName(): string | undefined {
    return this.name;
  }

  setPath(path: string | undefined) {
    this.path = path;
  }

  getPath(): string | undefined {
    return this.path;
  }

  setParentFolderID(parentFolderID: string | undefined) {
    this.parentFolderID = parentFolderID;
  }

  getParentFolderID(): string | undefined {
    return this.parentFolderID;
  }

  reset() {
    this.content = '';
    this.markdownID = '';
    this.name = '';
    this.path = '';
    this.parentFolderID = '';
  }
}
