import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar>
      <div class="header-container">
        <a class="app-title" routerLink="/"><span class="primary-text">Echo</span>
        </a>
        
        <div class="nav-items">
          <ng-container *ngIf="authService.isAuthenticated()">
            <a mat-button routerLink="/dashboard" class="nav-link">Dashboard</a>
            <a mat-button routerLink="/books" class="nav-link">Books</a>
            
            <button mat-button [matMenuTriggerFor]="profileMenu" class="profile-button">
              <mat-icon>person_outline</mat-icon>
            </button>
            <mat-menu #profileMenu="matMenu" class="profile-menu">
              <a mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon>
                <span>Profile</span>
              </a>
              <button mat-menu-item (click)="authService.logout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          </ng-container>
          
          <ng-container *ngIf="!authService.isAuthenticated()">
            <a mat-button routerLink="/auth/login" class="nav-link">Login</a>
            <a mat-button routerLink="/auth/register" class="auth-button">Sign up</a>
          </ng-container>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    mat-toolbar {
      background: white;
      border-bottom: 1px solid #eee;
      padding: 0;
      height: 64px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .app-title {
      text-decoration: none;
      color: #333;
      font-size: 1.5rem;
      font-weight: 500;
      letter-spacing: -0.5px;

      .primary-text {
        color: #9d8aa5;
      }
    }

    .nav-items {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-link {
      color: #7c6d85;
      font-weight: 400;
      text-transform: none;
      letter-spacing: normal;

      &:hover {
        color: #5d4d66;
        background: transparent;
      }
    }

    .auth-button {
      background: #9d8aa5;
      color: white;
      padding: 0 1.5rem;
      border-radius: 6px;
      font-weight: 500;

      &:hover {
        background: #7c6d85;
      }
    }

    .profile-button {
      min-width: 40px;
      padding: 0 8px;
      color: #7c6d85;

      &:hover {
        color: #5d4d66;
        background: transparent;
      }
    }

    ::ng-deep .profile-menu {
      margin-top: 8px;
    }

    @media (max-width: 600px) {
      .nav-link span {
        display: none;
      }
      
      .header-container {
        padding: 0 0.5rem;
      }
    }
  `]
})
export class HeaderComponent {
  constructor(public authService: AuthService) {}
} 