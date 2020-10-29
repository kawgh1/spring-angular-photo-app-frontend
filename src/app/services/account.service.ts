
import { Injectable } from '@angular/core';
// HttpClient is just the angular client used to make HTTP calls, GET, POST, etc.
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
// When a GET/POST request is sent to the server, an Observable is returned
import { Observable } from 'rxjs';
// used for authentication
import { JwtHelperService } from '@auth0/angular-jwt';
// the rest are classes we've created to handle the data and display
import { User } from '../models/user';
import { PasswordChange } from '../models/password-change';
import { Post } from '../models/post';
import { ServerConstant } from '../constants/server-constant';
// import GoogleMapsAPIKey from environment.ts
import { environment, APIKeys } from '../../environments/environment';



// the account service class will act as the middle man between the front end
// and backend API 





@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constant: ServerConstant = new ServerConstant();
  public host: string = this.constant.host;
  public token: string;
  // current user username
  public loggedInUsername: string | null;
  // redirectURL is used for if a user is logged in and token expires or session expires
  // and they try to access a protected resource from the backend, this will send them to
  //  to re-login/ re-authenticate and after that redirectURL will take them back to the resource
  // or page they were initially trying to access
  public redirectUrl: string;
  // public googleMapsAPIKey = '${GoogleMapsAPIKey}';
  public googleMapsAPIKey = APIKeys.GoogleMapsAPIKey;

  public googleMapsAPIUrl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=';
  public jwtHelper = new JwtHelperService();

  // first grab an instance of the HttpClient and use it to make calls to the API
  constructor(private http: HttpClient) { }

  // login takes in a user and returns an observable http response or error
  login(user: User): Observable<HttpErrorResponse | HttpResponse<any>> {
    // send the user as a JSON object and observe the response so we can get the header and token from the response
    return this.http.post<HttpErrorResponse | HttpResponse<any>>(`${this.host}/user/login`, user, { observe: 'response' });
  }

  // register takes a user and returns an observable of user or httperror
  register(user: User): Observable<User | HttpErrorResponse> {
    // send the user as JSON object to server to register
    return this.http.post<User>(`${this.host}/user/register`, user);
  }

  resetPassword(email: string) {
    return this.http.get(`${this.host}/user/resetPassword/${email}`, {
      // returns text only, not an observable
      responseType: 'text'
    });
  }

  logOut(): void {
    // set user token to null
    this.token = null;
    // remove token from user local storage in browser
    localStorage.removeItem('token');
  }

  // takes token string, returns void/nothing
  saveToken(token: string): void {
    // token is taken from the response header from the server
    this.token = token;
    // 'token' is the key and token is the actual token value
    localStorage.setItem('token', token);
  }

  // see if user client has token in local storage
  loadToken(): void {
    this.token = localStorage.getItem('token');
  }

  // return the actual token value
  getToken(): string {
    return this.token;
  }

  // check to see if user is logged in or not
  isLoggedIn(): boolean {
    this.loadToken();
    if (this.token != null && this.token !== '') {
      // sub is subject meaning username, checking to see if username is null or empty string
      if (this.jwtHelper.decodeToken(this.token).sub != null || '') {
        // so checking to make sure token and username are good, if so, return true
        if (!this.jwtHelper.isTokenExpired(this.token)) {
          this.loggedInUsername = this.jwtHelper.decodeToken(this.token).sub;
          return true;
        }
      }
    } else {
      // otherwise log whoever it is out and return false immediately
      this.logOut();
      return false;
    }
  }

  // return observable of user, take user to their username page
  getUserInformation(username: string): Observable<User> {
    return this.http.get<User>(`${this.host}/user/${username}`);
  }

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.host}/post/list`);
  }

  searchUsers(username: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.host}/user/findByUsername/${username}`);
  }

  // call to Google Maps API send long + lat as string and get back location JSON object with info
  getLocation(latitude: string, longitude: string): Observable<any> {
    return this.http.get<any>(`${this.googleMapsAPIUrl}` + `${latitude},${longitude}&key=${this.googleMapsAPIKey}`);
  }

  updateUser(updateUser: User): Observable<User> {
    return this.http.post<User>(`${this.host}/user/update`, updateUser);
  }

  changePassword(changePassword: PasswordChange) {
    return this.http.post(`${this.host}/user/changePassword`, changePassword, { responseType: 'text' });
  }

  uploadUserProfilePicture(profilePicture: File) {
    // we're just appending the user image to a html form object handled through javascript

    const fd = new FormData();
    fd.append('image', profilePicture);
    return this.http
      // then send the form data with image appended to the server
      .post(`${this.host}/user/photo/upload`, fd, { responseType: 'text' })
      .subscribe(
        (response: any) => {
          console.log(response);
          console.log('User profile picture was uploaded. ' + response);
        },
        error => {
          console.log(error);
        }
      );
  }
}
