import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { EditorModule } from 'primeng/editor';
import { EditAssetComponent } from './edit-asset/edit-asset.component';
import { WebcamModule } from 'ngx-webcam';
import { SignupComponent } from './signup/signup.component';
import { TreeSelectModule } from 'primeng/treeselect';
import { TreeModule } from 'primeng/tree';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { NodeService } from './services/home.service';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TreeTableModule } from 'primeng/treetable';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserService } from './services/user.service';
import { PasswordModule } from 'primeng/password';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { MenubarModule } from 'primeng/menubar';
import { SpeedDialModule } from 'primeng/speeddial';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FileUploadPopupComponent } from './file-upload-popup/file-upload-popup.component';
import { ToolbarModule } from 'primeng/toolbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {MatDialogModule} from "@angular/material/dialog";
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import EssentialsPlugin from '@ckeditor/ckeditor5-essentials/src/essentials';
import ImagePlugin from '@ckeditor/ckeditor5-image/src/image';
import ImageUploadPlugin from '@ckeditor/ckeditor5-image/src/imageupload';
import { ClickAtCoordinateDirective } from './click-at-coordinate.directive';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ImageUploadPopupComponent } from './image-upload-popup/image-upload-popup.component';
import { OcrPopupComponent } from './ocr-popup/ocr-popup.component';
import {MatTabsModule} from "@angular/material/tabs";
import {MatIconModule} from "@angular/material/icon";
import {MatTableModule} from "@angular/material/table";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import { JwtModule } from "@auth0/angular-jwt";
import { environment } from 'src/environments/environment';
import { TableModule} from 'primeng/table';

export function tokenGetter() {
  return localStorage.getItem('authToken');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    EditAssetComponent,
    SignupComponent,
    FileUploadPopupComponent,
    ClickAtCoordinateDirective,
    ImageUploadPopupComponent,
    OcrPopupComponent
  ],
  imports: [
    TableModule,
    CKEditorModule,
    ToolbarModule,
    ToggleButtonModule,
    ToastModule,
    FileUploadModule,
    SpeedDialModule,
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
    PasswordModule,
    ConfirmPopupModule,
    ToastModule,
    DialogModule,
    InputTextModule,
    ContextMenuModule,
    DragDropModule,
    CheckboxModule,
    ConfirmDialogModule,
    MatTabsModule,
    MatDialogModule,
    MatIconModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: [environment.apiURL],
        disallowedRoutes: ["http://example.com/examplebadroute/"],
      },
    }),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: [environment.apiURL],
        disallowedRoutes: ["http://example.com/examplebadroute/"],
      },
    }),
  ],
  providers: [NodeService, UserService, MessageService, DialogService, ConfirmationService],
  bootstrap: [AppComponent],
})
export class AppModule {}
