import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EditService {

  private content: string = '';
  private markdownID: string = '';
  private name: string = '';
  private path: string = '';
  private parentFolderID: string = '';

  constructor() { }

  setContent(content: string) {
    this.content = content;
  }

  getContent(): string {
    return this.content;
  }

  setMarkdownID(markdownID: string) {
    this.markdownID = markdownID;
  }

  getMarkdownID(): string {
    return this.markdownID;
  }

  setName(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  setPath(path: string) {
    this.path = path;
  }

  getPath(): string {
    return this.path;
  }

  setParentFolderID(parentFolderID: string) {
    this.parentFolderID = parentFolderID;
  }

  getParentFolderID(): string {
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
