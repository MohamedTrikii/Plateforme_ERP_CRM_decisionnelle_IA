import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { ProblemDetail } from '../models/api.model';

/**
 * errorInterceptor – handles HTTP errors globally.
 * - 401: redirect to login
 * - 403: show forbidden notification
 * - 422/400: let components handle field errors
 * - 500: show generic error notification
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth         = inject(AuthService);
  const notification = inject(NotificationService);
  const router       = inject(Router);

  return next(req).pipe(
    catchError(error => {
      const status  = error.status;
      const body    = error.error as ProblemDetail;
      const message = body?.detail ?? body?.title ?? 'An unexpected error occurred';

      switch (status) {
        case 401:
          auth.logout();
          notification.warn('Session expired. Please log in again.');
          break;
        case 403:
          notification.error('Access denied. You do not have permission.');
          router.navigate(['/app/dashboard']);
          break;
        case 404:
          // Let components handle 404s
          break;
        case 409:
          // Let components handle conflict errors
          break;
        case 0:
          notification.error('Cannot connect to the server. Please check your connection.');
          break;
        default:
          if (status >= 500) notification.error(`Server error: ${message}`);
      }

      return throwError(() => error);
    })
  );
};
