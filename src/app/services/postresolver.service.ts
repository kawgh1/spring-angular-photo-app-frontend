import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { Post } from '../models/post';
import { PostService } from './post.service';

@Injectable({
  providedIn: 'root'
})

// what is a Resolver?

// so if a user clicks on a post or a user profile, we don't want them to see that page
// until all of the data, images, comments, etc. until all of the page data is ready to display
// we don't want them to see bits and pieces of the page loading at different rates and display

// we want them to see everything at the same time, nice and clean UX
// this is what a resolver does
export class PostresolverService implements Resolve<Post>{

  constructor(private postService: PostService) { }

  // so when a user clicks on an image in our app, the url is localhost:4200/post/14

  // where 14 is the unique postId for that image

  // so that's the postId we want to get and pass into our resolver to fetch that particular post
  // we can get the postId by calling in the PostService
  resolve(route: ActivatedRouteSnapshot): Observable<Post> {

    // we retrieve the postId of image user clicked by accessing it from the route URL params
    const postId: number = route.params['postId'];
    return this.postService.getOnePostById(postId);

  }
}
