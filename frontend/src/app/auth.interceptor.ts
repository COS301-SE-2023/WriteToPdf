import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from './services/user.service';
import { MessageService } from 'primeng/api';
import { set } from 'cypress/types/lodash';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private userService:UserService, private messageService:MessageService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Add your authorization logic here if needed (e.g., adding tokens to headers)

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    this.messageService.add({severity:'error', summary:'Error', detail:'Your session has expired. Returning to login.'});
                    setTimeout(() => {
                    this.userService.logout();
                    }, 3000);
                }
                return throwError(error);
            })
        );
    }
}
