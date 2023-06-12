import { EnvironmentProviders } from '@angular/core';
import { QuillConfig } from './quill-editor.interfaces';
/**
 * Provides Quill configuration at the root level:
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideQuillConfig(...)]
 * });
 * ```
 */
export declare const provideQuillConfig: (config: QuillConfig) => EnvironmentProviders;
