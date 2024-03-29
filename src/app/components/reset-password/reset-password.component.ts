import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingService } from '../../services/loading.service';
import { AccountService } from '../../services/account.service';
import { AlertType } from '../../enums/alert-type.enum';
import { AlertService } from '../../services/alert.service';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(
    private accountService: AccountService,
    private loadingService: LoadingService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    if (this.accountService.isLoggedIn()) {
      if (this.accountService.redirectUrl) {
        this.router.navigateByUrl(this.accountService.redirectUrl);
      } else {
        this.router.navigateByUrl('/home');
      }
    } else {
      this.router.navigateByUrl('/reset-password');
    }
  }

  onResetpassword(form): void {
    this.loadingService.isLoading.next(true);
    console.log(form.email);
    const email: string = form.email;
    this.subscriptions.push(
      this.accountService.resetPassword(email).subscribe(
        (response) => {
          console.log(response);
          this.loadingService.isLoading.next(false);
          this.alertService.showAlert(
            'A new password has been sent to your email.',
            AlertType.INFO
          );
        },
        (error: HttpErrorResponse) => {
          console.log(error);
          const errorMsg = error.error;
          if (errorMsg === 'emailNotFound') {
            this.alertService.showAlert(
              'There is no account for this email. Please verify the email.',
              AlertType.WARNING
            );
          }
          if (errorMsg !== 'emailNotFound') {
            this.alertService.showAlert(
              'Some error occurred. Please try again.',
              AlertType.WARNING
            );
          }
          this.loadingService.isLoading.next(false);
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
