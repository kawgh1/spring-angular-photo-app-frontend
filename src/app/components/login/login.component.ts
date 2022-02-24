import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { LoadingService } from '../../services/loading.service';
import { AlertType } from '../../enums/alert-type.enum';
import { AlertService } from '../../services/alert.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private accountService: AccountService,
    private loadingService: LoadingService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    // if user is already logged in and goes to the login page,
    // we don't want them to see the login page, it's confusing

    // when user accesses login page check if user is logged in
    if (this.accountService.isLoggedIn()) {
      // if yes and has redirect url send them to redirect url
      if (this.accountService.redirectUrl) {
        this.router.navigateByUrl(this.accountService.redirectUrl);
      } else {
        // otherwise send them to user home page
        this.router.navigateByUrl('/home');
      }
      // if user is not logged in, send them to login page
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  onLogin(user: User): void {
    this.loadingService.isLoading.next(true);
    // console.log(user);
    this.subscriptions.push(
      this.accountService.login(user).subscribe(
        (response) => {
          const token: string = response.headers.get('Authorization');
          this.accountService.saveToken(token);
          if (this.accountService.redirectUrl) {
            this.router.navigateByUrl(this.accountService.redirectUrl);
          } else {
            this.router.navigateByUrl('/home');
          }
          this.loadingService.isLoading.next(false);
        },
        (error) => {
          console.log(error);
          this.loadingService.isLoading.next(false);
          this.alertService.showAlert(
            'Username or password incorrect.  Please try again.',
            AlertType.DANGER
          );
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe);
  }
}
