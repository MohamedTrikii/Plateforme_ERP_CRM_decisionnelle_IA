import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatToolbarModule }  from '@angular/material/toolbar';
import { MatSidenavModule }  from '@angular/material/sidenav';
import { MatListModule }     from '@angular/material/list';
import { MatIconModule }     from '@angular/material/icon';
import { MatButtonModule }   from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppRoutingModule }  from './app-routing.module';
import { AppComponent }      from './app.component';
import { JwtInterceptor }    from './core/auth/jwt.interceptor';
import { ConfigService }     from './core/services/config.service';
import { ThemeService }      from './shared/theme/theme.service';

// Shared components
import { NavbarComponent }   from './shared/components/navbar/navbar.component';
import { SidebarComponent }  from './shared/components/sidebar/sidebar.component';

/**
 * APP_INITIALIZER – loads public config before the app renders.
 * This ensures theme colors and branding are available immediately,
 * even on the login page.
 */
function initApp(configService: ConfigService) {
  return () => configService.loadPublicConfig();
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    // Angular Material
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    // JWT interceptor – auto-attaches Bearer token
    {
      provide:  HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi:    true,
    },
    // Load system config before first render
    {
      provide:    APP_INITIALIZER,
      useFactory: initApp,
      deps:       [ConfigService],
      multi:      true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
