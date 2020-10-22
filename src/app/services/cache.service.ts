import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

// Caching is a technique that stores a copy of a given resource in the front end on the browser
// and serves it back to
// the user or other service when requested. When a web cache has a requested resource
// in its store, it intercepts the API request and returns its copy instead of re-downloading
// from the API server.

// The cache service is a class service used so we don't send multiple Http requests to our
// backend API, or we don't send unnecessary calls - ideally to be more efficient with resources
// and provide a smoother, faster UX.

// we will use the cache-interceptor class to check every server/API request and if the request
// has something in our front end web cache, we will intercept the call and serve the cached 
// resource immediately instead of sending the request back to the server/API.

@Injectable({
    providedIn: 'root'
})
export class CacheService {

    constructor() { }

    // this object literal will store our cached resources, generally requestURLs
    // it is effectively the cache
    private request: any = {};

    // cache the request based on the URL, for ex. displaying a list of users
    cacheRequest(requestUrl: string, response: HttpResponse<any>): void {
        // so we take in the user requestedURL, see if it exists in our cache,
        // if it does, then that become the response to the user's request
        // and we store it in the cache
        // if not, we return void, do nothing and let the request through to server/API
        this.request[requestUrl] = response;
    }

    // getCache says, yes cacheRequest() said the requestedURL DOES exist in our cache
    // getCache says ok, return it to the user
    getCache(requestUrl: string): HttpResponse<any> | null {
        return this.request[requestUrl];
    }

    // this method invalidates whatever cache value/URL the cache currently has stored
    // does not clear the whole cache, just the value for the specific requestURL
    invalidateCache(requestUrl: string): void {
        this.request[requestUrl] = null;
    }

    // clear the whole cache
    clearCache(): void {
        this.request = {};
    }
}
