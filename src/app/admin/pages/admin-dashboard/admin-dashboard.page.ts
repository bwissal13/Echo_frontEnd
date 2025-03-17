import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AdminService } from '../../services/admin.service';
import { DashboardStats } from '../../models/admin.interface';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    SidebarComponent
  ],
  template: `
    <div class="app-container">
      <app-sidebar></app-sidebar>
      
      <div class="main-content">
        <div class="page-header">
          <h1>Admin Dashboard</h1>
        </div>

        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="40" color="accent"></mat-spinner>
        </div>

        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>

        <ng-container *ngIf="!loading && !error">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <mat-icon>people</mat-icon>
              </div>
              <div class="stat-info">
                <h3>Total Users</h3>
                <div class="stat-value">{{ stats?.totalUsers || 0 }}</div>
                <div class="stat-subtitle">{{ stats?.newUsersThisWeek || 0 }} new this week</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <mat-icon>assignment_ind</mat-icon>
              </div>
              <div class="stat-info">
                <h3>Role Requests</h3>
                <div class="stat-value">{{ stats?.pendingRoleRequests || 0 }}</div>
                <div class="stat-subtitle">Pending approval</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <mat-icon>library_books</mat-icon>
              </div>
              <div class="stat-info">
                <h3>Total Books</h3>
                <div class="stat-value">{{ stats?.totalBooks || 0 }}</div>
                <div class="stat-subtitle">{{ stats?.newBooksThisWeek || 0 }} new this week</div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <a routerLink="/admin/users" mat-flat-button class="action-btn">
              <mat-icon>manage_accounts</mat-icon>
              Manage Users
            </a>
            <a routerLink="/admin/role-requests" mat-flat-button class="action-btn">
              <mat-icon>assignment_ind</mat-icon>
              Role Requests
            </a>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      display: grid;
      grid-template-columns: auto 1fr;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .main-content {
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .page-header {
      margin-bottom: 32px;

      h1 {
        font-size: 32px;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      border: 1px solid rgba(157, 138, 165, 0.1);
      box-shadow: 0 4px 6px -1px rgba(157, 138, 165, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 12px -1px rgba(157, 138, 165, 0.2);
      }
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #9d8aa5, #7c6d85);

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: white;
      }
    }

    .stat-info {
      h3 {
        font-size: 14px;
        color: #666;
        margin: 0 0 8px;
        font-weight: 500;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 600;
        color: #1a1a1a;
        line-height: 1;
        margin-bottom: 8px;
      }

      .stat-subtitle {
        font-size: 13px;
        color: #666;
      }
    }

    .action-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;

      .action-btn {
        padding: 16px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: linear-gradient(135deg, #9d8aa5, #7c6d85);
        transition: transform 0.2s ease, box-shadow 0.2s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(157, 138, 165, 0.3);
        }

        mat-icon {
          margin-right: 8px;
        }
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }

    .error-message {
      color: #dc2626;
      background: #fee2e2;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      text-align: center;
    }
  `]
})
export class AdminDashboardPage implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  error: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDashboardStats();
  }

  private loadDashboardStats() {
    this.loading = true;
    this.error = null;

    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.error = 'Failed to load dashboard statistics. Please try again later.';
        this.loading = false;
      }
    });
  }
} 