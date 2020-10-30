import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { LoadingService } from '../../services/loading.service';
import { AlertService } from '../../services/alert.service';
import { PostService } from '../../services/post.service';
import { Subscription } from 'rxjs';
import { AlertType } from '../../enums/alert-type.enum';
import { Post } from '../../models/post';
import { User } from '../../models/user';

import { Comment } from '../../models/comment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  user = new User();
  posts: Post[] = [];
  host: string;
  userHost: string;
  postHost: string;
  userName: string;
  comment: Comment = new Comment();
  commentList: Array<object> = [];
  post: Post = new Post();
  like: string;
  isUser: boolean;
  postId: number;
  color: string;

  constructor(
    public accountService: AccountService,
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    //  don't initialize the home page if the user isn't logged in
    // otherwise we get errors trying to load data that isn't yet accessible
    if (this.accountService.isLoggedIn()) {
      this.loadingService.isLoading.next(true);
      this.getUserInfo(this.accountService.loggedInUsername);
      this.getPosts();



      this.host = this.postService.host;
      this.userHost = this.postService.userHost;
      this.postHost = this.postService.postHost;


      this.loadingService.isLoading.next(false);
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  getUserInfo(username: string): void {
    this.subscriptions.push(
      this.accountService.getUserInformation(username).subscribe(
        (response: User) => {
          this.displayLike(response);
          this.user = response;
        },
        error => {
          console.log(error);
          this.user = null;
          this.logOut();
          // logOut() already routes to /login
          // this.router.navigateByUrl('/login');
        }
      ));
  }

  logOut(): void {
    this.accountService.logOut();
    this.router.navigateByUrl('/login');
    this.alertService.showAlert(
      'Please log in to access this page.',
      AlertType.DANGER
    );
  }

  getUserProfile(username: string): void {
    this.router.navigate(['/profile', username]);
    console.log(username);
  }

  getPosts(): void {
    this.subscriptions.push(this.accountService.getPosts().subscribe(
      (response: Post[]) => {
        this.posts = response;
        console.log(this.posts);

        this.loadingService.isLoading.next(false);
      },
      error => {
        console.log(error);
        this.loadingService.isLoading.next(false);
      }
    ));
  }

  resolvePost(): void {
    const resolvedPost: Post = this.route.snapshot.data.resolvedPost;
    if (resolvedPost != null) {
      console.log(resolvedPost);
      this.post = resolvedPost;
      this.userHost = this.postService.userHost;
      this.postHost = this.postService.postHost;
      this.host = this.postService.host;
      this.getUserInfo(this.accountService.loggedInUsername);
      this.loadingService.isLoading.next(false);
    } else {
      this.loadingService.isLoading.next(false);
      this.alertService.showAlert('Post was not found.', AlertType.DANGER);
      this.router.navigateByUrl('/home');
    }
  }

  onDelete(id: number): void {
    this.subscriptions.push(
      this.postService.delete(id).subscribe(
        response => {
          console.log('The deleted post: ', response);
          this.alertService.showAlert(
            'Post was deleted successfully.',
            AlertType.SUCCESS
          );
          this.getPosts();
        },
        error => {
          console.log(error);
          this.alertService.showAlert(
            'Post was not deleted. Please try again.',
            AlertType.DANGER
          );
          this.getPosts();
        }
      ));
  }

  seeOnePost(postId): void {
    this.router.navigate(['/post', postId]);
    console.log(postId);
  }

  // comments and likes
  onAddComment(comment, post: Post) {
    this.comment.content = '';
    const newComment: Comment = new Comment();
    newComment.content = comment.value.content;
    newComment.postId = comment.value.postId;
    newComment.postedDate = new Date();
    newComment.username = comment.value.username;
    console.log(newComment);
    post.commentList.push(newComment);
    this.subscriptions.push(
      this.postService.saveComment(newComment).subscribe(
        response => {
          console.log(response);
          console.log('Comment has been saved to the database...');
        },
        error => {
          this.loadingService.isLoading.next(false);
          console.log(error);
        }
      )
    );
  }

  displayLike(user: User) {
    const result: Post = user.likedPost.find(post => post.id === this.post.id);
    if (result) {
      this.like = 'Unlike';
      this.color = '#18BC9C';
      console.log('testing');
    } else {
      this.like = 'Like';
      this.color = '#000000';
    }
  }

  likePost(post, user) {
    if (this.color === '#000000') {
      this.color = '#18BC9C';
      this.like = 'Unlike';
      this.doLike(post, user);
      post.likes += 1;
    } else {
      this.color = '#000000';
      this.like = 'Like';
      this.doUnlike(post, user);
      if (user.likedPosts != null) {
        for (let i = 0; i < user.likedPosts.length; i++) {
          if (user.likedPosts[i].id === post.id) {
            user.likedPosts.splice(i, 1);
          }
        }
      }
      if (post.likes > 0) {
        this.post.likes -= 1;
      }
    }
  }

  doLike(post, user) {
    this.subscriptions.push(
      this.postService.like(post.id, user.username).subscribe(
        response => {
          console.log(response);
        },
        error => {
          console.log(error);
        }
      )
    );
  }

  doUnlike(post, user) {
    this.subscriptions.push(
      this.postService.unLike(post.id, user.username).subscribe(
        response => {
          console.log(response);
        },
        error => {
          console.log(error);
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
