export class ServerConstant {

    // PRODUCTION ENV variables

    public host = 'https://spring-angular-photo-share-app.herokuapp.com';

    public s3imagehost = 'https://vineyard-photos.s3.us-east-2.amazonaws.com';

    public client = 'https://spring-angular-photoshar-front.herokuapp.com';

    public userPicture = `${this.s3imagehost}/images/users`;

    public postPicture = `${this.s3imagehost}/images/posts`;


    // DEV ENV variables

    // public host = 'http://localhost:8080';

    // public client = 'http://localhost:4200';

    // public userPicture = `${this.host}/images/users`;

    // public postPicture = `${this.host}/images/posts`;
}
