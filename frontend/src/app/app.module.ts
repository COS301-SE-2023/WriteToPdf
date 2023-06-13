import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { EditComponent } from './edit/edit.component';
import { EditorModule } from 'primeng/editor';
import { CameraComponent } from './camera/camera.component';
import { EditAssetComponent } from './edit-asset/edit-asset.component';
import { WebcamModule } from 'ngx-webcam';
import { SignupComponent } from './signup/signup.component';
import { TreeSelectModule } from 'primeng/treeselect';
import {TreeModule} from "primeng/tree";
import {FormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {MenuService, NodeService} from "./home/home.service";
import {BreadcrumbModule} from 'primeng/breadcrumb';
import {TreeTableModule} from 'primeng/treetable';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserService } from './services/user.service';
import { PasswordModule } from 'primeng/password';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { MenubarModule } from 'primeng/menubar';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    CameraComponent,
    EditAssetComponent,
    SignupComponent,
    EditComponent
  ],
  imports: [
    MenubarModule,
    VirtualScrollerModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    EditorModule,
    WebcamModule,
    TreeSelectModule,
    TreeModule,
    FormsModule,
    EditorModule,
    DropdownModule,
    BreadcrumbModule,
    TreeTableModule,
    SidebarModule,
    ButtonModule,
    BrowserAnimationsModule,
    PasswordModule
  ],
  providers: [NodeService, UserService, MenuService],
  bootstrap: [AppComponent],
})
export class AppModule {}
