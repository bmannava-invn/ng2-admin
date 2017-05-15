import { Injectable } from '@angular/core';
import {
  Http,
  ConnectionBackend,
  RequestOptions,
  Request,
  RequestOptionsArgs,
  Response,
  Headers,
  RequestMethod, BaseRequestOptions
} from '@angular/http';
import { Observable } from 'rxjs';
import { PartialObserver } from 'rxjs/Observer';
import { EventEmitter } from 'events';

@Injectable()
export class HttpController extends Http {

  static EVENTS: any = {
    access_token_changed: 'access_token_changed'
  };

  private accessToken: string;

  private eventEmitter: EventEmitter = new EventEmitter();

  private serverUrl: null;

  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions) {
    super(backend, defaultOptions);
  }

  private getServerUrl(url): Observable<string> {
    return new Observable((observer: PartialObserver<any>) => {
      if (!this.serverUrl) {
        let options = new RequestOptions();
        options.method = RequestMethod.Get;
        super.request("/config", options).map(res => {
          this.serverUrl = res.json().server_url;
          return `${this.serverUrl}${url}`;
        }).subscribe((url) => {
          observer.next(url);
          observer.complete();
        }, (error: any | Response) => observer.error(error));
      } else {
        observer.next(`${this.serverUrl}${url}`);
        observer.complete();
      }
    });
  }

  public setAccessToken(accessToken: string, error: string = '') {
    if (this.accessToken !== accessToken) {
      let event = {oldValue: this.accessToken, newValue: accessToken, errorText: error};
      this.accessToken = accessToken;
      this.eventEmitter.emit(HttpController.EVENTS.access_token_changed, event);
    }
  }

  private static getAuthenticationRequestOptions(body: String): RequestOptions {
    let refreshOptions = new BaseRequestOptions();
    refreshOptions.method = RequestMethod.Post;
    refreshOptions.body = body;
    refreshOptions.headers = new Headers({
      "Content-Type": "application/json",
    });
    return refreshOptions;
  }

  private static isInvalidTokenError(error: any | Response): boolean {
    return error instanceof Response && (<Response> error).status === 401;
  }

  private handleHttpError(error: any | Response, observer: PartialObserver<Response>) {
    if (HttpController.isInvalidTokenError(error)) {
      this.setAccessToken(null, 'Session is expired');
    }
    observer.error(error);
  }

  private setAuthorizationHeader(url: string | Request, options?: RequestOptionsArgs) {
    if (this.accessToken) {
      let headers = url instanceof Request ? (<Request> url).headers : options.headers;
      headers.set("Authorization", "Bearer " + this.accessToken);
    }
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    let localUrl = typeof url !== "string" ? (<Request> url).url : url;
    return new Observable((observer: PartialObserver<any>) => {      
      return this.getServerUrl(localUrl).flatMap((remoteUrl) => {
          if (typeof url !== "string") {
            (<Request> url).url = remoteUrl;
          } else {
            url = remoteUrl;
          }
          this.setAuthorizationHeader(url, options);
          return super.request(url, options)
        }
      ).subscribe((res) => observer.next(res), (error: any | Response) => this.handleHttpError(error, observer),
        () => observer.complete());
    });    
  }


  public authenticate(username: string, password: string): Observable < Request > {
    return new Observable((observer: PartialObserver<any>) => {
      let options = HttpController.getAuthenticationRequestOptions(JSON.stringify({
        username: username,
        password: password
      }));
      this.getServerUrl('/login').flatMap(url => super.request(url, options)).map((res: Response) => res.json())
        .subscribe((res: any) => {
          this.setAccessToken(res.token);
          observer.next(res);
        }, (error: any | Request) => observer.error(error), () => observer.complete());
    });
  }

  private addListener(event: string, listener: Function) {
    this.eventEmitter.on(event, listener);
    return this.removeListener.bind(this, event, listener);
  }

  private removeListener(event, listener) {
    this.eventEmitter.removeListener(event, listener);
  }

  public addAccessTokenChangeListener(listener): void {
    return this.addListener(HttpController.EVENTS.access_token_changed, listener);
  }
}