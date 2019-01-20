import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { map } from 'rxjs/operators';

/**
 * Insert the apropriate token for the service targeted by the url.
 */
const ACCESS_TOKEN_KEY = 'a_tk';
@Injectable()
export class MasterTokenInterceptor implements HttpInterceptor {
  private addMasterKey = false;
  constructor() {}

  configure(options?: { addMasterKey?: boolean } | null): MasterTokenInterceptor {
    const instance = new MasterTokenInterceptor();
    if (options && options.addMasterKey) {
      instance.addMasterKey = true;
    }
    return instance;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // TODO remove default key y production
    if (this.addMasterKey) {
      const a_token = sessionStorage.getItem(ACCESS_TOKEN_KEY) || 'ak6b2hzWgsUwf13nMB6HB23ILMgOo5P8';
      request = request.clone({
        setParams: { access_token: a_token }
      });
    }
    return next.handle(request);
  }
}
