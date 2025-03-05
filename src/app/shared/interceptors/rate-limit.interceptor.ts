import { HttpInterceptorFn, HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

export const rateLimitInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  return next(req).pipe(
    retry({
      count: 3,
      delay: (error, retryCount) => {
        if (error instanceof HttpErrorResponse && error.status === 429) {
          // Exponential backoff: 1s, 2s, 4s between retries
          const delayMs = Math.pow(2, retryCount - 1) * 1000;
          console.log(`Rate limited. Retrying in ${delayMs}ms...`);
          return timer(delayMs);
        }
        return throwError(() => error);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 429) {
        return throwError(() => ({
          error: 'Too many requests. Please try again in a moment.',
          status: 429
        }));
      }
      return throwError(() => error);
    })
  );
}; 