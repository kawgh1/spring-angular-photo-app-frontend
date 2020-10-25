import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';

// forms
import { FormsModule } from '@angular/forms';

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
import { CommonModule } from '@angular/common';



// routes

const appRoutes: Routes = [

  // login, signup and reset password do not require authentication
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // main home login page does require authentication -> AuthenticationGuard
  // AuthenticationGuard will route non-loggedIn users back to homepage/login
  // they are called protected routes
  { path: 'home', component: HomeComponent, canActivate: [AuthenticationGuard] },
  // PostResolver + AuthenticationGuard
  {
    path: 'post/:postId', component: PostDetailComponent,
    resolve: { resolvedPost: PostresolverService }, canActivate: [AuthenticationGuard]
  },
  // AuthenticationGuard
  { path: 'profile/:username', component: ProfileComponent, canActivate: [AuthenticationGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
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
    // added Angular Forms module for ngForms in HTML pages
    FormsModule,
    // add Angular HttpClientModule - Angular's mechanism for communicating with remote servers over HTTP
    HttpClientModule,
    CommonModule,
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
