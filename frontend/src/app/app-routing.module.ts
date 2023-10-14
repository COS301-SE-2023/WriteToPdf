import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { EditComponent } from './edit/edit.component';
import { CameraComponent } from './camera/camera.component';
import { EditAssetComponent } from './edit-asset/edit-asset.component';
import { SignupComponent } from './signup/signup.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'edit',
    loadChildren: () => import('./edit/edit.module').then(m => m.EditModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'camera',
    loadChildren: () => import('./camera/camera.module').then(m => m.CameraModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-asset',
    component: EditAssetComponent, canActivate: [AuthGuard],
  },
  { path: 'signup', component: SignupComponent },
  { path: 'landing-page', component: LandingPageComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
