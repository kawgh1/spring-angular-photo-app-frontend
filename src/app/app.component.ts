import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Alert } from './model/alert';
import { AlertService } from './service/alert.service';
import { LoadingService } from './service/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'vineyard-frontend';

  private subscriptions: Subscription[] = [];
  public alerts: Alert[] = [];
  public loading: boolean;

  // need to bring in loadingService and alertService into this class
  // so we use a constructor to do dependency injection for loadingService and alertService

  constructor(private loadingService: LoadingService, private alertService: AlertService) {

    this.loading = false;
  }
  // when this component is initialized ngOnInit() we have to listen to the Observables contained
  // in loadingService and accountService

  // here we listen for all the Observables and then push them to the Subscription array above
  // as the Observables become available/initialized

  // once the Observable subscriptions are pushed, then we can access any of them and monitor
  // their status in real time
  ngOnInit() {
    this.subscriptions.push(
      this.loadingService.isLoading.subscribe(isLoading => {
        // isLoading true or false
        this.loading = isLoading;
      })
    );

    this.subscriptions.push(
      this.alertService.alerts.subscribe(alert => {

        this.alerts.push(alert);
        // when we subscribe to the alert service its going to display the alert and we want
        // that to close automatically if user doesn't close alert
        this.closeAlert(3);
      })
    );

  }

  // close alert automatically after X seconds if user doesn't close alert
  // private because its only being used in this class
  private closeAlert(second: number): void {
    setTimeout(() => {

      const element: HTMLElement = document.getElementById('dismissAlert') as HTMLElement;
      element.click();
    }, second * 1000)
  }

  // important to unsubscribe - remove from our Subscriptions array[]- 
  // from services when the component is destroyed to avoid memory leaks
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe);
  }
}
