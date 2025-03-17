import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      console.log('Not authenticated, redirecting to login');
      this.router.navigate(['/auth/login']);
      return false;
    }
    
    if (!this.authService.hasRole('ADMIN')) {
      console.log('Not admin, redirecting to dashboard');
      this.router.navigate(['/dashboard']);
      return false;
    }
    
    console.log('Admin access granted');
    return true;
  }
} 