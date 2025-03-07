import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/services/auth.service';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <app-header *ngIf="!isAuthRoute()"></app-header>
    <div [class.content-container]="!isAuthRoute()">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .content-container {
      padding-top: 64px; /* Height of the toolbar */
      min-height: calc(100vh - 64px);
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
    }
  }

  isAuthRoute(): boolean {
    return this.router.url.includes('/auth/login') || 
           this.router.url.includes('/auth/register') ||
           this.router.url.includes('/auth/forgot-password') ||
           this.router.url.includes('/auth/reset-password');
  }
}
