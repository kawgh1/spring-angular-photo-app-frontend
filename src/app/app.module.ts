import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';

// components
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';

// services
import { PostresolverService } from './services/postresolver.service';
import { AccountService } from './services/account.service';
import { LoadingService } from './services/loading.service';
import { PostService } from './services/post.service';
import { AlertService } from './services/alert.service';

// guards
import { AuthenticationGuard } from './guards/authentication.guard';

// interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { CacheInterceptor } from './interceptors/cache.interceptor';

// third party modules
// loader display
import { NgxLoadingModule } from 'ngx-loading';


// routes

const appRoutes: Routes = [

  // login, signup and reset password do not require authentication
  { path: 'components/login', component: LoginComponent },
  { path: 'components/signup', component: SignupComponent },
  { path: 'components/reset-password', component: ResetPasswordComponent },
  { path: '', redirectTo: '/components/home', pathMatch: 'full' },
  // main home login page does require authentication -> AuthenticationGuard
  // AuthenticationGuard will route non-loggedIn users back to homepage/login
  // they are called protected routes
  { path: 'components/home', component: HomeComponent, canActivate: [AuthenticationGuard] },
  // PostResolver + AuthenticationGuard
  {
    path: 'components/post/:postId', component: PostDetailComponent,
    resolve: { resolvedPost: PostresolverService }, canActivate: [AuthenticationGuard]
  },
  // AuthenticationGuard
  { path: 'components/profile/:username', component: ProfileComponent, canActivate: [AuthenticationGuard] }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    ResetPasswordComponent,
    HomeComponent,
    ProfileComponent,
    NavbarComponent,
    PostDetailComponent
  ],
  imports: [
    BrowserModule,
    // import routes at the root level so Angular app is aware of the routes at root level
    RouterModule.forRoot(appRoutes),
    // import loader from third party module
    NgxLoadingModule.forRoot({})
  ],
  // Added Services and interceptors
  providers: [
    AccountService,
    LoadingService,
    PostService,
    AlertService,
    PostresolverService,
    AuthenticationGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
