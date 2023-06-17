import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor() { }

  saveDocument() {
    console.log('saveDocument() called');
  }

  sendSaveData() {
    const url = 'http://localhost:3000/file_manager/save';

  }

  retrieveDocument() {

  }

  sendRetrieveData() {
    const url = 'http://localhost:3000/file_manager/retrieve';
  }

  deleteDocument() {

  }

  sendDeleteData() {
    const url = 'http://localhost:3000/file_manager/delete';

  }

  renameDocument() {

  }

  sendRenameData() {
    const url = 'http://localhost:3000/file_manager/rename';
    
  }
  
  moveDocument() {
    
  }
  
  sendMoveData() {
    const url = 'http://localhost:3000/file_manager/move';

  }

}
