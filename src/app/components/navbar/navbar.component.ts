import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { AccountService } from '../../services/account.service';
import { LoadingService } from '../../services/loading.service';
import { PostService } from '../../services/post.service';
import { AlertType } from '../../enums/alert-type.enum';
import { User } from '../../models/user';
import { Post } from '../../models/post';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

// OnInit and OnDestroy are so this component can subscribe to services/subscriptions and destroy them as needed
export class NavbarComponent implements OnInit, OnDestroy {
  // subscriptions to initialize and destroy as needed
  private subscriptions: Subscription[] = [];

  user: User;
  // when a user searches for another user, we need an array of users to return
  searchedUser: User[];

  host: string;
  userHost: string;
  postHost: string;
  postPicture: File;
  userName: string;
  userLoggedIn: boolean;
  showNavbar: boolean;
  showSuccessAlert: boolean;
  photoName: string;

  // user location info
  latitude: any;
  longitude: any;
  location = null;
  progress: number;
  newPostURL: string;
  clientHost: string;
  postFail: boolean;

  constructor(
    // initialize router and needed services
    private router: Router,
    private alertService: AlertService,
    private accountService: AccountService,
    private postService: PostService,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    // set isLoading to true so while component is loading, user sees loading spinner display
    this.loadingService.isLoading.next(true);

    // host, clientHost, userHost, postHost from PostService class
    // this is to route  the image, user, post details of a post when a user clicks on different
    // images, posts or users so that we can return the correct resources to the user
    // variable placeholder for specific but dynamic server resources 
    this.host = this.postService.host;
    this.clientHost = this.postService.clientHost;
    this.userHost = this.postService.userHost;
    this.postHost = this.postService.postHost;

    // show navbar
    this.showNavbar = true;

    if (this.accountService.isLoggedIn()) {
      this.userName = this.accountService.loggedInUsername;
      this.getUserInfo(this.userName);
      this.getLonAndLat();
      this.loadingService.isLoading.next(false);
    } else {
      this.showNavbar = false;
      this.loadingService.isLoading.next(false);
    }
  }

  // subscribe the navbar to the current user's details and update display accordingly
  getUserInfo(username: string): void {
    this.subscriptions.push(
      this.accountService.getUserInformation(username).subscribe(
        (response: User) => {
          this.user = response;
          this.userLoggedIn = true;
          this.showNavbar = true;
        },
        error => {
          console.log(error);
          this.userLoggedIn = false;
        }
      ));
  }

  // this function is called when user clicks button on navbar
  // when user types in a username to search, that is the 'event' that triggers the method
  onSearchUsers(event) {
    console.log(event);
    const username = event;
    // accountService.searchUsers(username) goes to server and returns matching usernames
    this.subscriptions.push(this.accountService.searchUsers(username).subscribe(
      (response: User[]) => {
        console.log(response);
        this.searchedUser = response;
      },
      error => {
        console.log(error);
        //
        return this.searchedUser = [];
      }
    ));
  }

  getUserProfile(username: string): void {
    // route user to username profile page
    this.router.navigate(['/profile', username]);
  }

  // this function is called when user actually clicks on the username they searched for 
  getSearchUserProfile(username: string): void {
    // search modal dropdown will not go away when user clicks on a username
    // this removes the modal after clicking the username
    const element: HTMLElement = document.getElementById(
      'closeSearchModal'
    ) as HTMLElement;
    element.click();
    // then navigate to searched user's profile page
    this.router.navigate(['/profile', username]);
    // run reload to get the freshest user profile data from server
    setTimeout(() => {
      location.reload();
    }, 100);
  }

  // get picture user selects
  onFileSelected(event: any): void {
    console.log('file was selected');
    // set picture to be the picture associated with new post from user
    // to send picture file to server
    this.postPicture = event.target.files[0];
    // name of picture file
    this.photoName = this.postPicture.name;
  }

  onNewPost(post: Post): void {
    // closer pop up window after post submit if user doesn't close it
    const element: HTMLElement = document.getElementById(
      'dismissOnSubmitPost'
    ) as HTMLElement;
    element.click();
    // show loading spinner
    this.loadingService.isLoading.next(true);
    // send post data to server  through subscription
    this.subscriptions.push(
      this.postService.save(post).subscribe(
        (response: Post) => {
          // get response back from server to display post details page
          console.log(response);
          let postId: number = response.id;
          this.savePicture(this.postPicture);
          // remove loading spinner
          this.loadingService.isLoading.next(false);
          // set postURL
          this.newPostURL = `${this.clientHost}/post/${postId}`;
        },
        error => {
          console.log(error);
          // post failed, red alert message
          this.postFail = true;
          // remove loading spinner
          this.loadingService.isLoading.next(false);
        }
      )
    );
  }

  // take a picture file and send it to backend
  savePicture(picture: File): void {
    this.subscriptions.push(
      this.postService.uploadPostPicture(picture).subscribe(
        response => {
          // if the response back from server is a "still uploading"
          // we don't want to display a "post successful" message until upload is 100% complete
          if (response.type === HttpEventType.UploadProgress) {
            this.progress = (response.loaded / response.total) * 100;
          } else {
            console.log(response);
            // display "post successful" message for 8 seconds
            this.OnNewPostSuccess(8);
          }
        },
        error => {
          console.log(error);
        }
      )
    );
  }

  // after number seconds, reset newPostURL to null in case they do another new post
  OnNewPostSuccess(second: number): void {
    this.showSuccessAlert = true;
    setTimeout(() => {
      this.showSuccessAlert = false;
      this.newPostURL = null;
    }, second * 1000);
  }

  logOut(): void {
    // show loading spinner
    this.loadingService.isLoading.next(true);
    // logout from accountService
    this.accountService.logOut();
    // send back to login screen
    this.router.navigateByUrl('/login');
    // hide loading spinner
    this.loadingService.isLoading.next(false);
    this.alertService.showAlert(
      'You have been successfully logged out.',
      AlertType.SUCCESS
    );
  }

  getLonAndLat(): void {
    // if geolocation data is available from the user's browser, grab that first
    if (window.navigator && window.navigator.geolocation) {
      // takes callback with position data
      window.navigator.geolocation.getCurrentPosition(
        position => {
          // set our user position data for display
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.getUserLocation(this.latitude, this.longitude);
        },
        error => {
          switch (error.code) {
            case 1:
              console.log('Permission Location Denied.');
              break;
            case 2:
              console.log('Position Unavailable.');
              break;
            case 3:
              console.log('Timeout.');
              break;
          }
        }
      );
    }
  }

  getUserLocation(latitude, longitude): void {
    this.subscriptions.push(
      this.accountService.getLocation(latitude, longitude).subscribe(
        (response: any) => {
          this.location = response.results[3].formatted_address;
        },
        error => {
          console.log(error);
        }
      )
    );
  }

  // unsubscribe all subscriptions
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe);
  }
}
