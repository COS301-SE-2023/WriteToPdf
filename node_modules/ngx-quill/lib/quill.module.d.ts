import { ModuleWithProviders } from '@angular/core';
import { QuillConfig } from 'ngx-quill/config';
import * as i0 from "@angular/core";
import * as i1 from "./quill-editor.component";
import * as i2 from "./quill-view.component";
import * as i3 from "./quill-view-html.component";
export declare class QuillModule {
    static forRoot(config?: QuillConfig): ModuleWithProviders<QuillModule>;
    static ɵfac: i0.ɵɵFactoryDeclaration<QuillModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<QuillModule, never, [typeof i1.QuillEditorComponent, typeof i2.QuillViewComponent, typeof i3.QuillViewHTMLComponent], [typeof i1.QuillEditorComponent, typeof i2.QuillViewComponent, typeof i3.QuillViewHTMLComponent]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<QuillModule>;
}
