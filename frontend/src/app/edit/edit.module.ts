// edit.module.ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EditComponent } from './edit.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ContextMenuModule } from 'primeng/contextmenu';

@NgModule({
    declarations: [EditComponent],
    imports: [
        RouterModule.forChild([
            { path: '', component: EditComponent }
        ]),
        CheckboxModule,
        ConfirmDialogModule,
        ButtonModule,
        DialogModule,
        ToastModule,
        CommonModule,
        FormsModule,
        InputTextModule,
        ContextMenuModule,
    ],
    providers: [DialogService],
})
export class EditModule { }
