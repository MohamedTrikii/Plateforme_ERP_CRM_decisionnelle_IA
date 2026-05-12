import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SharedModule } from '../../../../../src/app/shared/shared.module';
import { ConfigService } from '../../core/services/config.service';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  standalone: true,
  imports: [
    SharedModule,
    MatSidenavModule,
    RouterModule,
    HeaderComponent,
    SidebarComponent,
  ],
  selector: 'app-shell',
  template: `
    <div class="shell-root">
      <app-header (menuToggle)="toggleSidebar()"></app-header>

      <mat-sidenav-container class="shell-container">
        <mat-sidenav
          #sidenav
          [mode]="isHandset ? 'over' : 'side'"
          [opened]="!isHandset"
          [fixedInViewport]="isHandset"
          fixedTopGap="64"
          class="shell-sidenav"
        >
          <app-sidebar (navigate)="closeSidebarOnMobile()"></app-sidebar>
        </mat-sidenav>

        <mat-sidenav-content class="shell-content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .shell-root {
      min-height: 100vh;
      background: var(--bg-color, #fafafa);
    }

    .shell-container {
      height: calc(100vh - 64px);
    }

    .shell-sidenav {
      width: 260px;
      border-right: 1px solid rgba(0, 0, 0, 0.08);
    }

    .shell-content {
      overflow: auto;
      background: var(--bg-color, #fafafa);
    }
  `],
})
export class ShellComponent implements OnInit {
  isHandset = false;
  sidebarOpened = true;

  constructor(
    private readonly breakpoint: BreakpointObserver,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.breakpoint.observe([Breakpoints.Handset]).subscribe((state) => {
      this.isHandset = state.matches;
      this.sidebarOpened = !state.matches;
    });

    this.configService.loadTenantConfig(this.authService.getTenantId() ?? '');
  }

  toggleSidebar(): void {
    this.sidebarOpened = !this.sidebarOpened;
  }

  closeSidebarOnMobile(): void {
    if (this.isHandset) {
      this.sidebarOpened = false;
    }
  }
}
