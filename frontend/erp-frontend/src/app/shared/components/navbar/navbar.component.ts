import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfigService } from '../../../core/services/config.service';
import { CONFIG_KEYS } from '../../../core/models/system-config.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls:  ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  @Output() menuToggle = new EventEmitter<void>();

  companyName = 'ERP Platform';
  logoUrl     = '';
  username    = '';

  constructor(
    public  authService:   AuthService,
    private configService: ConfigService,
    private router:        Router
  ) {}

  ngOnInit(): void {
    this.username = this.authService.currentUser?.username || '';
    this.configService.config$.subscribe(cfg => {
      this.companyName = cfg[CONFIG_KEYS.COMPANY_NAME]     || 'ERP Platform';
      this.logoUrl     = cfg[CONFIG_KEYS.COMPANY_LOGO_URL] || '';
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
