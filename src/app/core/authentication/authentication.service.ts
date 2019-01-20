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

export interface RegisterContext extends LoginContext {
  thumbnail: string;
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
    console.log(context);
    return this.httpClient
      .master()
      .post('/auth', context, {
        headers: { Authorization: 'basic ' + btoa(context.membername + ':' + context.password) }
      })
      .pipe(
        map((body: any) => {
          this.setCredentials(body, context.remember);
          return body;
        })
      );
  }

  /**
   * Authenticates the user.
   * @param context The login parameters.
   * @return The user credentials.
   */
  register(context: RegisterContext): Observable<any> {
    // Replace by proper authentication call

    context.membername = '@' + context.membername;
    return this.httpClient
      .master()
      .post('/identities', context)
      .pipe(
        map((body: any) => {
          this.setCredentials(body, context.remember);
          return body;
        })
      );
  }

  uploadAvatar(id: string, pictureForm: any) {
    return this.httpClient.token().put(`/identities/${id}/avatar`, pictureForm);
  }

  checkProfileExist(identifier: any) {
    if (EMAILREGEX.test(identifier)) {
      identifier = identifier;
    } else {
      if (identifier[0] !== '@') {
        identifier = '@' + identifier;
      }
    }

    return this.httpClient
      .cache()
      .master()
      .get('/identities/exist', {
        params: { key: identifier }
      })
      .pipe(map((body: any) => body));
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
      .master()
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
