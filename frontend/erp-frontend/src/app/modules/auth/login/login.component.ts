import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfigService } from '../../../core/services/config.service';
import { CONFIG_KEYS } from '../../../core/models/system-config.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: var(--primary-light, #E3F2FD);
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 40px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12);
    }
    .logo    { text-align: center; margin-bottom: 8px; }
    .logo img { height: 60px; }
    h2       { text-align: center; color: var(--primary-color); margin-bottom: 24px; }
    mat-form-field { width: 100%; }
    .login-btn     { width: 100%; margin-top: 16px; }
  `]
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  loading    = false;
  companyName = 'ERP Platform';
  logoUrl     = '';

  constructor(
    private fb:            FormBuilder,
    private authService:   AuthService,
    private router:        Router,
    private snackBar:      MatSnackBar,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    // Apply dynamic branding
    this.configService.config$.subscribe(config => {
      this.companyName = config[CONFIG_KEYS.COMPANY_NAME] || 'ERP Platform';
      this.logoUrl     = config[CONFIG_KEYS.COMPANY_LOGO_URL] || '';
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next:  ()    => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading = false;
        this.snackBar.open(
          err.error?.message || 'Login failed. Please check your credentials.',
          'Close',
          { duration: 4000 }
        );
      },
    });
  }
}
