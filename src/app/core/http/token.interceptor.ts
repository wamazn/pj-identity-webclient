import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { map } from 'rxjs/operators';

/**
 * Insert the apropriate token for the service targeted by the url.
 */
const ACCESS_TOKEN_KEY = 'a_tk';
const BEARER_TOKEN_KEY = 'b_tkn';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // TODO remove default key y production
    const a_token = sessionStorage.getItem(ACCESS_TOKEN_KEY) || 'ak6b2hzWgsUwf13nMB6HB23ILMgOo5P8';
    request = request.clone({ setParams: { access_token: a_token } });

    let b_token = localStorage.getItem(BEARER_TOKEN_KEY);
    if (b_token) {
      request.headers.set('Authorization', 'Bearer ' + b_token);
    }
    return next.handle(request).pipe(
      map((event: HttpEvent<HttpResponse<any>>) => {
        if (event instanceof HttpResponse) {
          const a_header = event.headers.get('Authorization');
          b_token = (a_header && a_header.split('Bearer ')[0]) || b_token;
          b_token = (event.body as any).token || b_token;
          localStorage.setItem(BEARER_TOKEN_KEY, b_token);
        }
        return event;
      })
    );
  }
}
