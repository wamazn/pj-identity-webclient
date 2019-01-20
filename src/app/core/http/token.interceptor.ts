import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { map } from 'rxjs/operators';

/**
 * Insert the apropriate token for the service targeted by the url.
 */
const BEARER_TOKEN_KEY = 'b_tkn';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private addToken = false;
  constructor() {}

  configure(options?: { addToken?: boolean } | null): TokenInterceptor {
    const instance = new TokenInterceptor();
    if (options && options.addToken) {
      instance.addToken = true;
    }
    return instance;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let b_token: string = null;
    if (this.addToken) {
      b_token = localStorage.getItem(BEARER_TOKEN_KEY);
      console.log('b_tkn', b_token);
      if (b_token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${b_token}`
          }
        });
      }
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
