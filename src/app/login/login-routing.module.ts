import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { LoginComponent } from './login.component';
import { LoginGuard } from './login.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    data: { title: extract('Login'), canActivate: [LoginGuard] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class LoginRoutingModule {}
