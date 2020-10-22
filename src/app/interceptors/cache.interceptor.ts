import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';
import { ServerConstant } from '../constants/server-constant';

// So if there is any POST request or PUT request or DELETE request, that will change the data 
// in the backend

// so first we have to make sure, if the request is one of those that can change data on the
// backend, then we have to invalidate our cache because we don't know what data is going to change
// could be nothing or could be a delete user request
// so if the data has changed on the back end, any stored data on the front end must be cleared
// and reset

// If the HTTP request is anything other than GET, then we must invalidate our cache

@Injectable()
export class CacheInterceptor implements HttpInterceptor {

    constant: ServerConstant = new ServerConstant();
    private host: string = this.constant.host;

    constructor(private cacheService: CacheService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // if request is NOT GET --> (POST, PUT, etc.)
        if (req.method !== 'GET') {
            // clear cache
            this.cacheService.clearCache();
            // return handle the request to the backend
            return next.handle(req);
        }

        // otherwise it IS a GET request and continue

        // next we have to ignore certain URLs, we dont want to cache anything that
        // has passwords or personal/sensitive info, or we also dont want to cache the login
        // because theres no point in caching login data, its one and done

        if (req.url.includes(`${this.host}/user/resetPassword/`)) {
            return next.handle(req);
        }

        if (req.url.includes(`${this.host}/user/register`)) {
            return next.handle(req);
        }

        if (req.url.includes(`${this.host}/user/login`)) {
            return next.handle(req);
        }

        // not caching a user search because we want any time a user searches for other users
        // that they are getting the most up to date list of users, a brand new request in real time
        if (req.url.includes(`${this.host}/user/findByUsername/`)) {
            return next.handle(req);
        }

        // so once we've made sure it IS a GET Request, and doesn't contain passwords
        // etc. and meets our cache criteria
        // then we say ok create a new cachedResponse object based on the user requestedURL
        const cachedResponse: HttpResponse<any> = this.cacheService.getCache(req.url);

        // if that requestURL is found in cache, return the cached Response
        if (cachedResponse) {
            return of(cachedResponse);
        }

        // if we DONT have that requestURL in cache, then at this point we need to SAVE it
        // in the cache because we know it IS a GET request, doesn't have passwords,
        // meets our cache criteria and we don't have it in cache -> so we need to add it for best UX

        // so here we say ok handle the user request from the API, but pipe it to extend the observable
        // tap into the values of that request
        return next.handle(req)
            // so the tap is going to take a callback function to evaluate the event
            .pipe(tap(event => {
                // if the user requestedURL resource returns an instance of a standard HttpResponse
                if (event instanceof HttpResponse) {
                    // then we want to cache that, because we know its exactly the type of request
                    // we store in our cache - and if its not then we ignore it
                    this.cacheService.cacheRequest(req.url, event);

                    // and we're checking this on every server request
                }
            }));

    }
}