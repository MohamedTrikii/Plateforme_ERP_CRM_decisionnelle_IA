import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { ThemeService } from './shared/theme/theme.service';

@Component({
  selector: 'app-root',
  template: `
    <ng-container *ngIf="authService.isLoggedIn(); else authLayout">
      <mat-sidenav-container class="app-container">

        <!-- Dynamic sidebar -->
        <mat-sidenav #sidenav mode="side" opened class="app-sidenav">
          <app-sidebar></app-sidebar>
        </mat-sidenav>

        <!-- Main content -->
        <mat-sidenav-content>
          <app-navbar (menuToggle)="sidenav.toggle()"></app-navbar>
          <main class="main-content">
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>

      </mat-sidenav-container>
    </ng-container>

    <!-- Auth layout (no sidebar/navbar) -->
    <ng-template #authLayout>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .app-container { height: 100vh; }
    .app-sidenav   { width: 240px; }
    .main-content  { padding: 24px; }
  `]
})
export class AppComponent implements OnInit {

  constructor(
    public authService: AuthService,
    private themeService: ThemeService   // injected to trigger theme init
  ) {}

  ngOnInit(): void {
    // ThemeService subscribes to ConfigService in its constructor,
    // so injection is sufficient to start the theme engine.
  }
}
