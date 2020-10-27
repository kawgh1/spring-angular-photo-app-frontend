export class ServerConstant {

    // DEV ENV variables
    public host = 'https://spring-angular-photo-share-app.herokuapp.com';

    public s3imagehost = 'https://vineyard-photos.s3.us-east-2.amazonaws.com';

    public client = 'https://spring-angular-photoshar-front.herokuapp.com';

    public userPicture = `${this.s3imagehost}/images/users`;

    public postPicture = `${this.s3imagehost}/images/posts`;
}
