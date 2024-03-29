// camera.module.ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CameraComponent } from './camera.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
    declarations: [CameraComponent],
    imports: [
        RouterModule.forChild([
            { path: '', component: CameraComponent }
        ]),
        CheckboxModule,
        ConfirmDialogModule,
        ButtonModule,
        DialogModule,
        ToastModule,
        CommonModule,
        FormsModule,
        InputTextModule,
        ImageCropperModule,
    ],
    providers: [DialogService],
})
export class CameraModule { }
