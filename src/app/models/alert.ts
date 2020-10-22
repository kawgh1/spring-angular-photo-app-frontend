import { AlertType } from '../enums/alert-type.enum'

export class Alert {
    text: string;
    type: AlertType;

    // default alert type = success, but can pass any type
    constructor(text, type = AlertType.SUCCESS) {
        this.text = text;
        this.type = type;
    }

}