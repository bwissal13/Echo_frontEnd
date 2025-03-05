import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.getAuthState().pipe(
      take(1),
      tap(authState => {
        console.log('AuthGuard - Auth State:', authState);
      }),
      map(authState => {
        if (authState.isAuthenticated) {
          console.log('AuthGuard - User is authenticated');
          return true;
        }

        console.log('AuthGuard - User is not authenticated, redirecting to login');
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      })
    );
  }
} 