import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Alert } from '../models/alert';
import { AlertType } from '../enums/alert-type.enum';

// alert service is just a class that will handle sending the user
// various alerts based on their actions in the app

@Injectable({
    providedIn: 'root'
})
export class AlertService {

    // Subject is like an Observable but it can broadcast multiple messages to other Observables
    // doing it this way because we need to send the Alert Message everywhere in the application
    // at the same time for the user, no matter what page of the app they are on,
    // this way they will always immediately get the alert
    public alerts: Subject<Alert> = new Subject();

    constructor() { }

    showAlert(message: string, alertType: AlertType): void {
        const alert = new Alert(message, alertType);
        // here 'alerts' is the Subject object we just created and we pass it
        // the alert object of predefined message and type we just created on line above
        this.alerts.next(alert);
    }
}
