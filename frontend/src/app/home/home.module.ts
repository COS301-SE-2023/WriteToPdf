// edit.module.ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { DialogService } from 'primeng/dynamicdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { TreeSelectModule } from 'primeng/treeselect';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Menubar, MenubarModule } from 'primeng/menubar';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
    declarations: [HomeComponent],
    imports: [
        RouterModule.forChild([
            { path: '', component: HomeComponent }
        ]),
        CheckboxModule,
        ConfirmDialogModule,
        ButtonModule,
        DialogModule,
        ToastModule,
        CommonModule,
        FormsModule,
        ContextMenuModule,
        TreeSelectModule,
        TreeModule,
        TreeTableModule,
        DragDropModule,
        MenubarModule,
        InputTextModule,
    ],
    providers: [DialogService],
})
export class HomeModule { }
