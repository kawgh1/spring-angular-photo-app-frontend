import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AccountService } from '../service/account.service';
import { AlertService } from '../service/alert.service';
import { AlertType } from '../enum/alert-type.enum'

// this class and stub were created by entering "ng g guard /guard/authentication" in the terminal 
@Injectable({
  providedIn: 'root'
})

// CanActivate is an Angular interface that will determine whether or not Angular
// should activate a URL route or not if the user tries to access this route, it just
// returns true or false
export class AuthenticationGuard implements CanActivate {

  // this is the default method which we will override for our purposes
  // canActivate(
  //   route: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  //   return true;
  // }

  // so we just need to call the accountService to see if the user is logged in or not
  // also need to call the alertService to tell the user why they were not able to access
  // a certain resource URL
  // also need to call the router, because if they don't have access, we need to reroute
  // the user to the appropriate page (login for example)

  constructor(private accountService: AccountService, private alertService: AlertService,
    private router: Router) { }
  // Overriden method
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {

    // the URL the user is trying to access is stored in the route state
    return this.isLoggedIn(state.url);
  }

  // helper function to call from canActivate()
  private isLoggedIn(url: string): boolean {

    if (this.accountService.isLoggedIn) {
      return true;
    }
    else {

      // now if the user was NOT logged in, we need to get the URL resource they were trying to access
      // hold it, send them to login, and after login/authentication, route them back to the URL
      // they were trying to access (if they have authorization, 
      // otherwise display new alert message "Not authorized", etc.)

      this.accountService.redirectURL = url;
      this.router.navigate(['/login']);
      this.alertService.showAlert('You must be logged in to access this page!', AlertType.DANGER);
      return false;

    }
  }

}
