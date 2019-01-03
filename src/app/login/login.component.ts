import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
// @ts-ignore: import any;
import * as md5 from 'js-md5';

import { environment } from '@env/environment';
import { Logger, I18nService, AuthenticationService } from '@app/core';

const log = new Logger('Login');

enum loginStateEnum {
  IDENTIFY,
  LOGIN
}

@Component({
  selector: 'pj-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  version: string = environment.version;
  pwdError: string;
  mbrError: string;
  identifierForm: FormGroup;
  passWordForm: FormGroup;
  isLoading = false;
  step = loginStateEnum.IDENTIFY;
  profilePreview: any;
  redirectRoute: string;
  defaultAvatar: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private i18nService: I18nService,
    private authenticationService: AuthenticationService,
    private _location: Location
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.redirectRoute = params.redirect;
    });
  }

  findMember() {
    this.isLoading = true;
    this.authenticationService
      .getProfilPreview(this.identifierForm.value['identifier'])
      .pipe(
        finalize(() => {
          this.identifierForm.markAsPristine();
          this.isLoading = false;
        })
      )
      .subscribe(
        profilePreview => {
          this.profilePreview = profilePreview;
          log.debug(`${profilePreview.membername} Member found`);
          this.defaultAvatar = 'https://www.gravatar.com/avatar/' + md5(profilePreview.email) + '?d=identicon';
          this.step = loginStateEnum.LOGIN;
        },
        error => {
          log.debug(`member not found: ${error}`);
          this.mbrError = error;
        }
      );
  }

  goBack() {
    this._location.back();
  }

  cancel() {
    this.identifierForm.markAsPristine();
    this.passWordForm.reset();

    this.step = loginStateEnum.IDENTIFY;
    this.goBack();
  }

  login() {
    this.isLoading = true;
    this.authenticationService
      .login({ ...this.passWordForm.value, membername: this.profilePreview.membername })
      .pipe(
        finalize(() => {
          this.passWordForm.markAsPristine();
          this.isLoading = false;
        })
      )
      .subscribe(
        credentials => {
          log.debug(`${credentials.membername} successfully logged in`);
          this.router.navigate([this.redirectRoute || '/'], { replaceUrl: true });
        },
        error => {
          log.debug(`Login error: ${error}`);
          this.pwdError = error;
        }
      );
  }

  setLanguage(language: string) {
    this.i18nService.language = language;
  }

  get currentLanguage(): string {
    return this.i18nService.language;
  }

  get languages(): string[] {
    return this.i18nService.supportedLanguages;
  }

  private createForm() {
    this.identifierForm = this.formBuilder.group({
      identifier: ['', Validators.required]
    });

    this.passWordForm = this.formBuilder.group({
      password: ['', Validators.required],
      remember: true
    });
  }
}
