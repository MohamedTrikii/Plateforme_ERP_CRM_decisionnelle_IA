import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="auth-container">
      <div class="auth-card mat-elevation-z4">
        <div class="auth-header">
          <mat-icon class="auth-logo">business_center</mat-icon>
          <h1>ERP Platform</h1>
          <p>Sign in to your account</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Username</mat-label>
            <input matInput formControlName="username" autocomplete="username" placeholder="Enter username">
            <mat-icon matPrefix>person</mat-icon>
            <mat-error *ngIf="loginForm.get('username')?.hasError('required')">Username is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'"
                   formControlName="password" autocomplete="current-password">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
          </mat-form-field>

          <button mat-flat-button color="primary" class="w-100 submit-btn"
                  type="submit" [disabled]="loading || loginForm.invalid">
            <mat-spinner *ngIf="loading" diameter="20" class="btn-spinner"></mat-spinner>
            <span *ngIf="!loading">Sign In</span>
          </button>

          <div class="auth-footer">
            <span>Don't have an account?</span>
            <a routerLink="/auth/register">Create account</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, var(--primary-color) 0%, #283593 100%);
      padding: 24px;
    }
    .auth-card {
      background: white; border-radius: 16px; padding: 40px;
      width: 100%; max-width: 420px;
    }
    .auth-header {
      text-align: center; margin-bottom: 32px;
      .auth-logo { font-size: 48px; width: 48px; height: 48px; color: var(--primary-color); }
      h1 { font-size: 26px; font-weight: 700; margin: 8px 0 4px; color: #1a1a2e; }
      p  { color: #666; margin: 0; font-size: 14px; }
    }
    .auth-form { display: flex; flex-direction: column; gap: 8px; }
    .submit-btn { height: 48px; font-size: 16px; font-weight: 600; margin-top: 8px; border-radius: 8px; }
    .btn-spinner { display: inline-block; margin: auto; }
    .auth-footer {
      text-align: center; margin-top: 20px; font-size: 14px; color: #666;
      a { color: var(--primary-color); text-decoration: none; font-weight: 600; margin-left: 6px; }
    }
  `]
})
export class LoginComponent {
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  loading      = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notification: NotificationService,
    private router: Router,
  ) {}

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login({ username: username!, password: password! }).subscribe({
      next: () => {
        this.notification.success('Welcome back!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.detail ?? 'Invalid username or password';
        this.notification.error(msg);
      },
    });
  }
}
