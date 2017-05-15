import { XHRBackend, Http, RequestOptions } from '@angular/http';
import {HttpController} from './http.controller';


export function httpFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions): Http {
    return new HttpController(xhrBackend, requestOptions);
}