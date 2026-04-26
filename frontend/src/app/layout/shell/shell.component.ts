import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { ConfigService } from '../../core/services/config.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  template: `
    <mat-sidenav-container class="shell-container">

      <!-- Sidebar navigation -->
      <mat-sidenav #sidenav
        [mode]="isMobile ? 'over' : 'side'"
        [opened]="!isMobile"
        class="app-sidenav">
        <app-sidebar (closeSidenav)="sidenav.close()"></app-sidebar>
      </mat-sidenav>

      <!-- Main content area -->
      <mat-sidenav-content class="main-content">
        <app-header (toggleSidenav)="sidenav.toggle()"></app-header>
        <main class="content-area">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>

    </mat-sidenav-container>
  `,
  styles: [`
    .shell-container { height: 100vh; }
    .app-sidenav     { width: var(--sidebar-width); border-right: 1px solid var(--border-color); background: var(--surface-color); }
    .main-content    { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
    .content-area    { flex: 1; overflow-y: auto; background: var(--background-color); }
  `]
})
export class ShellComponent implements OnInit {
  isMobile = false;

  constructor(
    private breakpoint: BreakpointObserver,
    private configService: ConfigService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Detect mobile viewport
    this.breakpoint.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile = result.matches;
    });

    // Load tenant config & apply theme
    const tenantId = this.authService.getTenantId();
    this.configService.loadPublicConfig(tenantId).subscribe();
  }
}
