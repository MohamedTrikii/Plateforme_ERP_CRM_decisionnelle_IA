import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styles: [`
    .register-container {
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh; background: var(--primary-light, #E3F2FD);
    }
    .register-card {
      width: 100%; max-width: 480px; padding: 40px;
      background: white; border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12);
    }
    h2           { text-align: center; color: var(--primary-color); margin-bottom: 24px; }
    mat-form-field { width: 100%; }
    .submit-btn  { width: 100%; margin-top: 16px; }
  `]
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  loading = false;

  constructor(
    private readonly fb:          FormBuilder,
    private readonly authService: AuthService,
    private readonly router:      Router,
    private readonly snackBar:    MatSnackBar
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      fullName: ['', Validators.required],
      tenantId: ['', Validators.required],
      role:     ['USER'],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.snackBar.open('Account created!', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Registration failed', 'Close', { duration: 4000 });
      },
    });
  }
}
