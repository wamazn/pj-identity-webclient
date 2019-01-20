import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { finalize, debounceTime, switchMap, debounce } from 'rxjs/operators';

import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import * as md5 from 'js-md5';

import { environment } from '@env/environment';
import { Logger, I18nService, AuthenticationService } from '@app/core';
import { Utils } from '@app/core/utils.service';

const log = new Logger('Register');
const REGEX_PSWD_STRENGTH = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

enum registerStateEnum {
  REGISTER,
  PICTURE
}

@Component({
  selector: 'pj-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  version: string = environment.version;
  pwdError: string;
  mbrError: boolean = false;
  emailError: string = '';
  registerForm: FormGroup;
  isLoading = false;
  showCropper = false;
  step = registerStateEnum.REGISTER;
  profilePreview: any = {};
  redirectRoute: string;
  loadedFile: File;
  loadedFileUrl = '';
  fileName = '';
  croppedImage: any = '';
  defaultAvatar = 'https://www.gravatar.com/avatar?d=mp';
  imageChangedEvent: any = '';
  cropperConfig = {
    aspectRatio: 1 / 1,
    cropperMinWidth: 100,
    resizeToWidth: 300
  };

  @ViewChild(ImageCropperComponent)
  imageCropper: ImageCropperComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private i18nService: I18nService,
    private authenticationService: AuthenticationService,
    private utils: Utils
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.redirectRoute = params.redirect;
    });
  }

  verifyMemberName() {
    if (this.registerForm.controls.membername.value)
      return this.authenticationService.checkProfileExist(this.registerForm.controls.membername.value).subscribe(
        (value: any) => {
          // check member existance
          console.log(value);
          this.mbrError = value.memberExist;
          this.registerForm.controls.membername.updateValueAndValidity({ onlySelf: true });
        },
        err => (this.mbrError = true)
      );
  }

  verifyEmail() {
    if (this.registerForm.controls.email.value)
      return this.authenticationService.checkProfileExist(this.registerForm.controls.email.value).subscribe(
        (value: any) => {
          // check member existance
          this.emailError = value.memberExist ? 'EMAIL_EXIST' : '';
          this.registerForm.controls.email.updateValueAndValidity({ onlySelf: true });
        },
        err => (this.emailError = 'EEROR_VERIFYING_EMAIL')
      );
  }

  register() {
    this.isLoading = true;
    return (
      this.registerForm.valid &&
      this.authenticationService
        .register({
          ...this.registerForm.value,
          thumbnail: 'https://www.gravatar.com/avatar/' + md5(this.registerForm.value.email)
        })
        .pipe(
          finalize(() => {
            this.registerForm.markAsPristine();
            this.isLoading = false;
          })
        )
        .subscribe(
          credentials => {
            console.log(credentials);
            this.profilePreview = credentials.identity;
            this.step = registerStateEnum.PICTURE;
            /* this.route.queryParams.subscribe(params =>
            this.router.navigate([params.redirect || '/'], { replaceUrl: true })
          ); */
          },
          error => {
            log.debug(`Register error: ${error}`);
            this.pwdError = error;
          }
        )
    );
  }

  drop(files: FileList) {
    this.cacheAndPreview(files[0]);
  }

  selectFile($event: any) {
    console.log($event);
    // this.imageChangedEvent = $event;
    this.cacheAndPreview($event.target.files[0]);
  }

  cacheAndPreview(file: File) {
    this.loadedFile = file;
    this.fileName = file.name;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.imageChangedEvent = null;
      this.loadedFileUrl = e.target.result;
      console.log(e);
      this.showCropper = true;
    };

    reader.readAsDataURL(this.loadedFile);
  }

  upload() {
    this.isLoading = false;
    let inputFile = new FormData();
    let pix = this.utils.convertBase64ToPng(this.croppedImage);
    inputFile.append('avatar', pix);
    this.authenticationService
      .uploadAvatar(this.profilePreview.id, inputFile)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(
        result => {
          console.log(result);
        },
        err => {
          console.log(err);
        }
      );
  }

  //////////////////////////////////////////////////
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  imageLoaded() {
    this.showCropper = true;
  }
  cropperReady() {
    console.log('Cropper ready');
  }
  loadImageFailed() {
    console.log('Load failed');
  }
  rotateLeft() {
    this.imageCropper.rotateLeft();
  }
  rotateRight() {
    this.imageCropper.rotateRight();
  }

  flipHorizontal() {
    this.imageCropper.flipHorizontal();
  }

  flipVertical() {
    this.imageCropper.flipVertical();
  }

  /////////////////////////////////////

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
    this.registerForm = this.formBuilder.group({
      membername: ['', Validators.compose([Validators.required, this.memberNameValidator()])],
      email: ['', Validators.compose([Validators.required, Validators.email, this.emailExistValidator()])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6), this.passwordVlidator])],
      passwordRepeate: ['', Validators.compose([Validators.required, Validators.minLength(6), this.passwordEqual()])],
      key: ['', Validators.compose([Validators.required, this.keyTypeValidator])]
    });
  }

  private keyTypeValidator(control: AbstractControl): ValidationErrors | null {
    return /\d{4}/.test(control.value) && control.value.length == 4 ? null : { valid: false };
  }

  private passwordVlidator(control: AbstractControl): ValidationErrors | null {
    return REGEX_PSWD_STRENGTH.test(control.value) ? null : { valid: false };
  }

  private passwordEqual() {
    return (control: AbstractControl): ValidationErrors | null => {
      let res: any = null;
      if (control.value && this.registerForm.controls.password.value) {
        res = control.value === this.registerForm.controls.password.value ? null : { valid: false };
      }
      return res;
    };
  }

  private memberNameValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.mbrError ? { message: this.mbrError } : null;
    };
  }
  private emailExistValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.emailError ? { message: this.emailError } : null;
    };
  }
}
