import { Http } from '@angular/http';
import { HttpController } from './http.controller';
import { Injectable } from '@angular/core';
import { LocalStorageService } from 'angular-2-local-storage';
import { Router } from '@angular/router';

@Injectable()
export class AuthenticationService {
  private static ACCESS_TOKEN_KEY = 'accessToken';

  private loggedIn: boolean = false;
  private http: HttpController = null;
  private lastError: string;
  private progress: boolean = false;

  constructor(http: Http, private router: Router, private localStorage: LocalStorageService) {
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

  public login(username: string, password: string): void {
    this.progress = true;
    this.http.authenticate(username, password).subscribe(null, (error) => {
      this.lastError = error.status === 401 || error.status === 400 ? 'Invalid username or password' : error.statusText;
      this.loggedIn = false;
      this.progress = false;
    });
  }

  public logout(): void {
    this.progress = true;
    this.http.post('/logout', null).subscribe(() => {
      this.progress = false;
      this.localStorage.remove(AuthenticationService.ACCESS_TOKEN_KEY);
      this.setLoggedIn(false);
    }, () => this.progress = false);
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