import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

/**
 * NotificationService – thin wrapper around MatSnackBar for toast messages.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {

  private readonly defaults: MatSnackBarConfig = {
    duration: 3500,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  constructor(private snackBar: MatSnackBar) {}

  success(message: string): void {
    this.snackBar.open(message, '✕', {
      ...this.defaults,
      panelClass: ['snack-success'],
    });
  }

  error(message: string): void {
    this.snackBar.open(message, '✕', {
      ...this.defaults,
      duration: 5000,
      panelClass: ['snack-error'],
    });
  }

  info(message: string): void {
    this.snackBar.open(message, '✕', {
      ...this.defaults,
      panelClass: ['snack-info'],
    });
  }

  warn(message: string): void {
    this.snackBar.open(message, '✕', {
      ...this.defaults,
      panelClass: ['snack-warn'],
    });
  }
}
