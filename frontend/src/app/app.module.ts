import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { EditComponent } from './edit/edit.component';
import { EditApi } from './edit/edit.api';
import { EditorModule } from 'primeng/editor';
import { CameraComponent } from './camera/camera.component';
import { EditAssetComponent } from './edit-asset/edit-asset.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    CameraComponent,
    EditAssetComponent,
    
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    EditorModule,

  ],
  providers: [EditApi],
  bootstrap: [AppComponent],
})
export class AppModule {}
