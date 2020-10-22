import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { ServerConstant } from '../constants/server-constant';

@Injectable({
    providedIn: 'root'
})
export class PostService {

    constant: ServerConstant = new ServerConstant();
    public host = this.constant.host;
    public clientHost = this.constant.client;
    public userHost = this.constant.userPicture;
    public postHost = this.constant.postPicture;

    constructor(private http: HttpClient) { }

    // take a post save a post
    save(post: Post): Observable<Post> {
        return this.http.post<Post>(`${this.host}/post/save`, post);
    }

    // take a number, return a post by id
    getOnePostById(postId: number): Observable<Post> {
        return this.http.get<Post>(`${this.host}/post/getPostById/${postId}`);
    }

    // take a username, return list of posts by that username
    getPostsByUsername(username: string): Observable<Post[]> {
        return this.http.get<Post[]>(`${this.host}/post/getPostByUsername/${username}`);
    }

    // take a comment, add it to a post
    saveComment(comment: Comment): Observable<Comment> {
        return this.http.post<Comment>(`${this.host}/post/comment/add`, comment);
    }

    // take a number, delete that post id
    delete(postId: number): Observable<Post> {
        return this.http.delete<Post>(`${this.host}/post/delete/${postId}`);
    }

    // take post id of post to like and username of user liking post into the request
    // get a text response back
    like(postId: number, username: string) {
        return this.http.post(`${this.host}/post/like/`, { postId, username }, {
            responseType: 'text'
        });
    }

    // take post id of post to unlike and username of user liking post into the request
    // get a text response back
    unLike(postId: number, username: string) {
        return this.http.post(`${this.host}/post/unLike/`, { postId, username }, {
            responseType: 'text'
        });
    }

    uploadPostPicture(recipePicture: File) {
        // create html formdata object
        const fd = new FormData();
        // append image to object
        fd.append('image', recipePicture, recipePicture.name);
        // send image object to server and get back some variables to determine
        // was upload successful and tell user once action event completed
        return this.http.post(`${this.host}/post/photo/upload`, fd, {
            responseType: 'text',
            reportProgress: true,
            observe: 'events'
        });
    }


}
