import { ModuleWithProviders } from '@angular/core';
import { QuillConfig } from './quill-editor.interfaces';
import * as i0 from "@angular/core";
/**
 * This `NgModule` provides a global Quill config on the root level, e.g., in `AppModule`.
 * But this eliminates the need to import the entire `ngx-quill` library into the main bundle.
 * The `quill-editor` itself may be rendered in any lazy-loaded module, but importing `QuillModule`
 * into the `AppModule` will bundle the `ngx-quill` into the vendor.
 */
export declare class QuillConfigModule {
    static forRoot(config: QuillConfig): ModuleWithProviders<QuillConfigModule>;
    static ɵfac: i0.ɵɵFactoryDeclaration<QuillConfigModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<QuillConfigModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<QuillConfigModule>;
}
