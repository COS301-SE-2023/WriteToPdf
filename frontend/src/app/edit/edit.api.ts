import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ITest } from './interfaces';

@Injectable({
  providedIn: 'root',
})
export class EditApi {
  private apiUrl = 'http://localhost:3000'; // TODO: Add to .env and remove here

  constructor(private http: HttpClient) {}

  getLoremIpsum(): Observable<ITest> {
    return this.http.get<ITest>(
      `${this.apiUrl}/test`,
    );
  }
}
