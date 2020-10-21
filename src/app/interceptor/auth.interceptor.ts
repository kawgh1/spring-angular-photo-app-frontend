import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountService } from '../service/account.service';

// so with authentication interceptor, we're checking every user request to the backend server/API
// and if it's a request that doesn't require the authentication token/header or it's a request
// to another server (Google API, etc.) then we don't want to add our auth token/header to the request

// otherwise, let's preform every request to be authenticated (once user authenticates by logging in),
// and this way, the backend doesn't have to go through authentication on every request.
// fast but secure

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private accountService: AccountService) { }

    // here we're taking any request and also calling HttpHandler which is used to
    // pass the request on to the server once we're done with the code below
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // check if requestURL even needs authentication, if auth not required
        // then just send it on to the server/API

        if (req.url.includes(`${this.accountService.host}/user/login`)) {
            return next.handle(req);
        }

        if (req.url.includes(`${this.accountService.host}/user/register`)) {
            return next.handle(req);
        }

        if (req.url.includes(`${this.accountService.host}/user/resetPassword/`)) {
            return next.handle(req);
        }

        if (req.url.includes('https://maps.googleapis.com/')) {
            return next.handle(req);
        }

        // otherwise we need to authenticate the request by loading the token into the header
        this.accountService.loadToken();
        const token = this.accountService.getToken();
        // however, HTTP request are immutable, so we can't modify the header of the original
        // request, so we have to clone it with the new auth token in the header
        // then send the new request on to the server/API. 
        const request = req.clone({ setHeaders: { Authorization: token } });
        return next.handle(request);
    }

}
