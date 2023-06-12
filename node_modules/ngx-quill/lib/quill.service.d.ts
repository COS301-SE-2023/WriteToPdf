import { Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { QuillConfig, CustomModule } from 'ngx-quill/config';
import * as i0 from "@angular/core";
export declare class QuillService {
    config: QuillConfig;
    private Quill;
    private document;
    private quill$;
    constructor(injector: Injector, config: QuillConfig);
    getQuill(): Observable<any>;
    /**
     * Marked as internal so it won't be available for `ngx-quill` consumers, this is only
     * internal method to be used within the library.
     *
     * @internal
     */
    registerCustomModules(Quill: any, customModules: CustomModule[] | undefined, suppressGlobalRegisterWarning?: boolean): Promise<any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<QuillService, [null, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<QuillService>;
}
