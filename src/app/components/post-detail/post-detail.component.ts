import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { AccountService } from '../../services/account.service';
import { PostService } from '../../services/post.service';
import { LoadingService } from '../../services/loading.service';
import { AlertType } from '../../enums/alert-type.enum';
import { User } from '../../models/user';
import { Post } from '../../models/post';
import { Comment } from '../../models/comment';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
})
export class PostDetailComponent implements OnInit {
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
  currentYear: number = new Date().getFullYear();

  constructor(
    public accountService: AccountService,
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadingService.isLoading.next(true);
    this.comment.content = '';
    this.resolvePost();
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

  getUserInfo(username: string): void {
    this.subscriptions.push(
      this.accountService.getUserInformation(username).subscribe(
        (response: User) => {
          this.displayLike(response);
          this.user = response;
          console.log(this.user);
        },
        (error) => {
          console.log(error);
        }
      )
    );
  }

  getUserProfile(username: string): void {
    this.router.navigate(['/profile', username]);
    console.log(username);
  }

  onDelete(id: number) {
    this.subscriptions.push(
      this.postService.delete(id).subscribe(
        (response) => {
          console.log('The deleted post: ', response);
          this.alertService.showAlert(
            'Post was deleted successfully.',
            AlertType.INFO
          );
          this.router.navigateByUrl('/home');
        },
        (error) => {
          console.log(error);
          this.alertService.showAlert(
            'Post was not deleted. Please try again.',
            AlertType.WARNING
          );
        }
      )
    );
  }

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
        (response) => {
          console.log(response);
          console.log('Comment has been saved to the database...');
        },
        (error) => {
          this.loadingService.isLoading.next(false);
          console.log(error);
        }
      )
    );
  }

  displayLike(user: User) {
    const result: Post = user.likedPost.find(
      (post) => post.id === this.post.id
    );
    if (result) {
      this.like = 'Unlike';
      this.color = '#bc5a18';
      console.log('testing');
    } else {
      this.like = 'Like';
      this.color = '#222';
    }
  }

  likePost(post, user) {
    if (this.color === '#222') {
      this.color = '#bc5a18';
      this.like = 'Unlike';
      this.doLike(post, user);
      post.likes += 1;
    } else {
      this.color = '#222';
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
        (response) => {
          console.log(response);
        },
        (error) => {
          console.log(error);
        }
      )
    );
  }

  doUnlike(post, user) {
    this.subscriptions.push(
      this.postService.unLike(post.id, user.username).subscribe(
        (response) => {
          console.log(response);
        },
        (error) => {
          console.log(error);
        }
      )
    );
  }
}
