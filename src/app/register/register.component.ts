import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { finalize, debounceTime } from 'rxjs/operators';

import { CropperComponent } from 'angular-cropperjs';

import { environment } from '@env/environment';
import { Logger, I18nService, AuthenticationService } from '@app/core';

const log = new Logger('Register');

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
  mbrError: string;
  registerForm: FormGroup;
  passWordForm: FormGroup;
  isLoading = false;
  showCroper = false;
  step = registerStateEnum.PICTURE;
  profilePreview: any;
  redirectRoute: string;
  loadedFile: File;
  loadedFileUrl = 'https://material.angular.io/assets/img/examples/shiba2.jpg';
  config = {
    zoomable: true,
    movable: true,
    aspectRatio: 16 / 9,
    dragMode: 'move',
    cropBoxResizable: false,
    data: {
      y: 100,
      height: 450
    }
  };

  @ViewChild('angularCropper')
  public angularCropper: CropperComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private i18nService: I18nService,
    private authenticationService: AuthenticationService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.redirectRoute = params.redirect;
    });

    this.registerForm.controls.membername.valueChanges.pipe(debounceTime(500)).subscribe((value: string) => {
      // check member existance
      log.debug(`${value} Member not found`);
    });

    this.registerForm.controls.email.valueChanges.pipe(debounceTime(500)).subscribe((value: string) => {
      // check member existance
      log.debug(`${value} email not found`);
    });
  }

  findMember() {
    this.authenticationService
      .getProfilPreview(this.registerForm.value['identifier'])
      .pipe(
        finalize(() => {
          this.registerForm.markAsPristine();
          this.isLoading = false;
        })
      )
      .subscribe(
        profilePreview => {
          this.profilePreview = profilePreview;
          log.debug(`${profilePreview.membername} Member found`);
          this.step = registerStateEnum.REGISTER;
          /* this.route.queryParams.subscribe(params =>
             this.router.navigate([params.redirect || '/'], { replaceUrl: true })
          ); */
        },
        error => {
          log.debug(`member not found: ${error}`);
          this.mbrError = error;
        }
      );
  }

  register() {
    this.isLoading = true;
    /* this.authenticationService
      .register({...this.passWordForm.value, membername: this.profilePreview.membername })
      .pipe(
        finalize(() => {
          this.passWordForm.markAsPristine();
          this.isLoading = false;
        })
      )
      .subscribe(
        credentials => {
          log.debug(`${credentials.membername} successfully logged in`);
          this.route.queryParams.subscribe(params =>
            this.router.navigate([params.redirect || '/'], { replaceUrl: true })
          );
        },
        error => {
          log.debug(`Register error: ${error}`);
          this.pwdError = error;
        }
      ); */
    this.step = registerStateEnum.PICTURE;
  }

  drop(files: FileList) {
    console.log('dropping - files', files);
    this.cacheAndPreview(files[0]);
  }

  selectFile($event: any) {
    console.log($event.target.files);
    this.cacheAndPreview($event.target.files[0]);
  }

  cacheAndPreview(file: File) {
    this.loadedFile = file;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      this.loadedFileUrl = e.target.result;
      this.showCroper = true;
    };

    reader.readAsDataURL(this.loadedFile);
    // this.loadedFileUrl = URL.createObjectURL(this.loadedFile);
  }

  upload() {}

  zoom(level: number) {
    this.angularCropper.cropper.zoom(level);
  }

  rotate(angle: number) {
    this.angularCropper.cropper.rotate(angle);
  }

  move(leftRight: number, upDown: number) {
    this.angularCropper.cropper.move(leftRight, upDown);
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
    this.registerForm = this.formBuilder.group({
      membername: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      passwordRepeate: ['', Validators.compose([Validators.required, Validators.minLength(6), this.passwordEqual])],
      key: ['', Validators.compose([Validators.required, Validators.maxLength(4), Validators.minLength(4)])]
    });
  }

  private passwordEqual(control: AbstractControl): ValidationErrors | null {
    return null;
  }
}
