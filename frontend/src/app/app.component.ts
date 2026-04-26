import { Component } from '@angular/core';

/**
 * AppComponent – root shell; hosts the router-outlet.
 * All layout and feature routing happens within the RouterModule routes.
 */
@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {}
