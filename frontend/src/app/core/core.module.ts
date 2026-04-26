import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * CoreModule – imports once at root level.
 * Contains singleton services (guards, interceptors, global services).
 * Guard against re-import using SkipSelf.
 */
@NgModule({
  imports: [CommonModule],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parent: CoreModule) {
    if (parent) throw new Error('CoreModule already loaded. Import only in AppModule.');
  }
}
