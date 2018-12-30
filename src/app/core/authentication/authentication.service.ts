import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

export interface Credentials {
  // Customize received credentials here
  membername: string;
  token: string;
}

export interface LoginContext {
  membername: string;
  password: string;
  remember?: boolean;
}

const credentialsKey = 'credentials';

const EMAILREGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

/**
 * Provides a base for authentication workflow.
 * The Credentials interface as well as login/logout methods should be replaced with proper implementation.
 */
@Injectable()
export class AuthenticationService {
  private _credentials: Credentials | null;

  constructor(private httpClient: HttpClient) {
    const savedCredentials = sessionStorage.getItem(credentialsKey) || localStorage.getItem(credentialsKey);
    if (savedCredentials) {
      this._credentials = JSON.parse(savedCredentials);
    }
  }

  /**
   * Authenticates the user.
   * @param context The login parameters.
   * @return The user credentials.
   */
  login(context: LoginContext): Observable<Credentials> {
    // Replace by proper authentication call
    const data = {
      membername: context.membername,
      token: '123456'
    };
    this.setCredentials(data, context.remember);
    return of(data);
    /* return this.httpClient
                .cache()
                .post('/', context)
                .pipe(map((body: any) => body.value)); */
  }

  /**
   * Authenticates the user.
   * @param context The login parameters.
   * @return The user credentials.
   */
  register(context: LoginContext): Observable<Credentials> {
    // Replace by proper authentication call
    const data = {
      membername: context.membername,
      token: '123456'
    };
    this.setCredentials(data, context.remember);
    return of(data);
    /* return this.httpClient
                .cache()
                .post('/', context)
                .pipe(map((body: any) => body.value)); */
  }

  getProfilPreview(identifier: any) {
    if (EMAILREGEX.test(identifier)) {
      identifier = identifier;
    } else {
      if (identifier[0] !== '@') {
        identifier = '@' + identifier;
      }
    }

    return this.httpClient
      .cache()
      .get('/identities/preview', {
        params: { key: identifier }
      })
      .pipe(map((body: any) => body));
  }

  /**
   * Logs out the user and clear credentials.
   * @return True if the user was logged out successfully.
   */
  logout(): Observable<boolean> {
    // Customize credentials invalidation here
    this.setCredentials();
    return of(true);
  }

  /**
   * Checks is the user is authenticated.
   * @return True if the user is authenticated.
   */
  isAuthenticated(): boolean {
    return !!this.credentials;
  }

  /**
   * Gets the user credentials.
   * @return The user credentials or null if the user is not authenticated.
   */
  get credentials(): Credentials | null {
    return this._credentials;
  }

  /**
   * Sets the user credentials.
   * The credentials may be persisted across sessions by setting the `remember` parameter to true.
   * Otherwise, the credentials are only persisted for the current session.
   * @param credentials The user credentials.
   * @param remember True to remember credentials across sessions.
   */
  private setCredentials(credentials?: Credentials, remember?: boolean) {
    this._credentials = credentials || null;

    if (credentials) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(credentialsKey, JSON.stringify(credentials));
    } else {
      sessionStorage.removeItem(credentialsKey);
      localStorage.removeItem(credentialsKey);
    }
  }
}
