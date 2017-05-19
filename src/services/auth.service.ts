import { Http } from '@angular/http';
import { HttpController } from './http.controller';
import { Injectable } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthenticationService {
  private static ACCESS_TOKEN_KEY = 'accessToken';

  private loggedIn: boolean = false;
  private http: HttpController = null;
  private lastError: string;
  private progress: boolean = false;
  private rememberme: boolean;

  constructor(http: Http, private router: Router, private localStorage: LocalStorageService, private toastrService: ToastrService) {
    this.http = <HttpController> http;
    let accessToken = <string>this.localStorage.get(AuthenticationService.ACCESS_TOKEN_KEY);
    if (accessToken) {
      this.http.setAccessToken(accessToken);
      this.loggedIn = true;
    }
    this.http.addAccessTokenChangeListener((event) => {
      !!event.newValue ? this.localStorage.set('accessToken', event.newValue) :
        this.localStorage.remove(AuthenticationService.ACCESS_TOKEN_KEY);
      this.setLoggedIn(!!event.newValue, event.errorText);
    });
  }

  public login(username: string, password: string, rememberme: boolean): void {
    this.progress = true;
    if (rememberme) {
      this.localStorage.set('username', username);
      this.localStorage.set('password', password);
      this.rememberme = rememberme;
    } else {
      this.localStorage.remove('username');
      this.localStorage.remove('password');
    }
    this.http.authenticate(username, password).subscribe(null, (error) => {
      this.lastError = error.status === 401 || error.status === 400 ? 'Invalid username or password' : error.statusText;
      this.loggedIn = false;
      this.progress = false;
      this.toastrService.error('Username or Password is wrong!', 'Oops!');
    });
  }

  public logout(): void {
    this.progress = true;
    // this.http.post('/logout', null).subscribe(() => {
      this.progress = false;
      this.localStorage.remove(AuthenticationService.ACCESS_TOKEN_KEY);
      if (this.rememberme) {
        this.localStorage.remove('username');
        this.localStorage.remove('password');
      }
      this.setLoggedIn(false);
      this.router.navigate(['/login']);
    // }, () => this.progress = false);
  }

  public inProgress(): boolean {
    return this.progress;
  }

  public isLoggedIn(): boolean {
    return this.loggedIn;
  }

  public getLastError(): string {
    return this.lastError;
  }

  private setLoggedIn(loggedIn: boolean, errorDescription = '') {
    this.loggedIn = loggedIn;
    this.lastError = errorDescription;
    this.progress = false;
    this.router.navigate([this.isLoggedIn() ? "/" : "/login"]);
  }
}
