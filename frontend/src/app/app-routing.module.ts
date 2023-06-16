import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { EditComponent } from './edit/edit.component';
import { CameraComponent } from './camera/camera.component';
import { EditAssetComponent } from './edit-asset/edit-asset.component';
import { SignupComponent } from './signup/signup.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', component: LoginComponent,  },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent/* canActivate: /[AuthGuard]*/ },
  { path: 'edit', component: EditComponent, canActivate: [AuthGuard] },
  { path: 'camera', component: CameraComponent, canActivate: [AuthGuard] },
  { path: 'edit-asset', component: EditAssetComponent, canActivate: [AuthGuard] },
  { path: 'signup', component: SignupComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
