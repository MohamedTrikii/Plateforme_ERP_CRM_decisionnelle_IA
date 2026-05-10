import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="auth-container">
      <div class="auth-card mat-elevation-z4">
        <div class="auth-header">
          <mat-icon class="auth-logo">person_add</mat-icon>
          <h1>Create Account</h1>
          <p>Join the ERP Platform</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">

          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="fullName" placeholder="John Doe">
            <mat-icon matPrefix>badge</mat-icon>
            <mat-error *ngIf="f['fullName'].hasError('required')">Full name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Username</mat-label>
            <input matInput formControlName="username" placeholder="johndoe">
            <mat-icon matPrefix>person</mat-icon>
            <mat-error *ngIf="f['username'].hasError('required')">Username is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="john@company.com">
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="f['email'].hasError('email')">Invalid email address</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Password</mat-label>
            <input matInput [type]="hide ? 'password' : 'text'" formControlName="password">
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix type="button" (click)="hide = !hide">
              <mat-icon>{{ hide ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="f['password'].hasError('minlength')">Min 8 characters</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Company ID (Tenant)</mat-label>
            <input matInput formControlName="tenantId" placeholder="e.g. acme">
            <mat-icon matPrefix>business</mat-icon>
            <mat-error *ngIf="f['tenantId'].hasError('required')">Tenant ID is required</mat-error>
          </mat-form-field>

          <button mat-flat-button color="primary" class="w-100 submit-btn"
                  type="submit" [disabled]="loading || registerForm.invalid">
            <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
            <span *ngIf="!loading">Create Account</span>
          </button>

          <div class="auth-footer">
            <span>Already have an account?</span>
            <a routerLink="/auth/login">Sign in</a>
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
    .auth-card { background: white; border-radius: 16px; padding: 40px; width: 100%; max-width: 440px; }
    .auth-header {
      text-align: center; margin-bottom: 28px;
      .auth-logo { font-size: 48px; width: 48px; height: 48px; color: var(--primary-color); }
      h1 { font-size: 24px; font-weight: 700; margin: 8px 0 4px; }
      p  { color: #666; margin: 0; font-size: 14px; }
    }
    .auth-form { display: flex; flex-direction: column; gap: 4px; }
    .submit-btn { height: 48px; font-size: 16px; font-weight: 600; margin-top: 8px; border-radius: 8px; }
    .auth-footer {
      text-align: center; margin-top: 20px; font-size: 14px; color: #666;
      a { color: var(--primary-color); text-decoration: none; font-weight: 600; margin-left: 6px; }
    }
  `]
})
export class RegisterComponent {
  registerForm = this.fb.group({
    fullName: ['', Validators.required],
    username: ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    tenantId: ['', Validators.required],
  });
  loading = false;
  hide    = true;

  get f() { return this.registerForm.controls; }

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly notification: NotificationService,
    private readonly router: Router,
  ) {}

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;
    const val = this.registerForm.value;

    this.authService.register({
      username: val.username!,
      email:    val.email!,
      password: val.password!,
      fullName: val.fullName!,
      role:     'USER',
      tenantId: val.tenantId!,
    }).subscribe({
      next: () => {
        this.notification.success('Account created! Welcome aboard.');
        this.router.navigate(['/app/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.notification.error(err?.error?.detail ?? 'Registration failed. Please try again.');
      },
    });
  }
}
