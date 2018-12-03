import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Logger } from '../core/logger.service';
import { AuthenticationService } from '../core/authentication/authentication.service';

const log = new Logger('LoginGuard');

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private router: Router, private authenticationService: AuthenticationService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authenticationService.isAuthenticated()) {
      return true;
    }

    log.debug('Authenticated, redirecting and adding redirect url...');
    this.router.navigate(['/selectaccount'], { queryParams: { redirect: state.url }, replaceUrl: true });
    return false;
  }
}
