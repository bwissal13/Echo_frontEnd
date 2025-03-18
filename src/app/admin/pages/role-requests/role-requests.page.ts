import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AdminService } from '../../services/admin.service';
import { RoleRequestDialogComponent } from './role-request-dialog.component';

@Component({
  selector: 'app-role-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    SidebarComponent
  ],
  template: `
    <div class="app-container">
      <app-sidebar></app-sidebar>
      
      <div class="main-content">
        <div class="page-header">
          <h1>Role Requests</h1>
          <p class="subtitle">Manage user role change requests</p>
        </div>

        <div class="table-container">
          <div *ngIf="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <span>Loading requests...</span>
          </div>
          
          <table mat-table [dataSource]="roleRequests" *ngIf="!loading">
            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef>User</th>
              <td mat-cell *matCellDef="let request">
                <div class="user-info">
                  <div class="user-name">{{ request.userFullName }}</div>
                  <div class="user-email">{{ request.userEmail }}</div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="requestedRole">
              <th mat-header-cell *matHeaderCellDef>Requested Role</th>
              <td mat-cell *matCellDef="let request">
                <span class="role-badge" [class]="request.requestedRole.toLowerCase()">
                  {{ request.requestedRole }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="reason">
              <th mat-header-cell *matHeaderCellDef>Reason</th>
              <td mat-cell *matCellDef="let request" class="reason-cell">
                <div class="reason-text">{{ request.reason }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let request">
                <div class="date-info">
                  {{ request.createdAt | date:'mediumDate' }}
                  <div class="time-info">{{ request.createdAt | date:'shortTime' }}</div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let request">
                <div class="action-buttons">
                  <button mat-flat-button color="primary" class="approve-btn" (click)="approveRequest(request)">
                    <mat-icon>check_circle</mat-icon>
                    Approve
                  </button>
                  <button mat-stroked-button color="warn" class="reject-btn" (click)="rejectRequest(request)">
                    <mat-icon>cancel</mat-icon>
                    Reject
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <!-- No Data Row -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell empty-row" [attr.colspan]="displayedColumns.length">
                <div class="empty-state">
                  <mat-icon>inbox</mat-icon>
                  <p>No pending role requests</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
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
        font-size: 28px;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0 0 8px 0;
      }

      .subtitle {
        font-size: 16px;
        color: #6b7280;
        margin: 0;
      }
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #6b7280;
      gap: 12px;
      
      .loading-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: #3b82f6;
        animation: spin 1s ease-in-out infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    }

    .table-container {
      background: white;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
      }

      th {
        background: #f9fafb;
        color: #4b5563;
        font-weight: 600;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 16px;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
      }

      td {
        font-size: 14px;
        padding: 16px;
        border-bottom: 1px solid #f3f4f6;
        vertical-align: top;
      }
      
      tr:last-child td {
        border-bottom: none;
      }
      
      tr:hover td {
        background-color: #f9fafb;
      }
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      
      .user-name {
        font-weight: 500;
        color: #111827;
      }
      
      .user-email {
        font-size: 12px;
        color: #6b7280;
      }
    }

    .role-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &.author {
        background: #e0e7ff;
        color: #4f46e5;
      }
      
      &.admin {
        background: #fef3c7;
        color: #d97706;
      }
      
      &.editor {
        background: #d1fae5;
        color: #059669;
      }
    }

    .reason-cell {
      max-width: 300px;
      
      .reason-text {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #374151;
        line-height: 1.5;
      }
    }
    
    .date-info {
      color: #374151;
      
      .time-info {
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
      }
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      
      button {
        font-size: 13px;
        border-radius: 8px;
        
        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          margin-right: 6px;
        }
      }
      
      .approve-btn {
        background-color: #4f46e5;
        
        &:hover {
          background-color: #4338ca;
        }
      }
      
      .reject-btn {
        border-color: #ef4444;
        color: #ef4444;
        
        &:hover {
          background-color: rgba(239, 68, 68, 0.05);
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #6b7280;
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      
      p {
        font-size: 16px;
        margin: 0;
      }
    }
    
    @media (max-width: 768px) {
      .main-content {
        padding: 16px;
      }
      
      .table-container {
        overflow-x: auto;
      }
      
      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class RoleRequestsPage implements OnInit {
  roleRequests: any[] = [];
  displayedColumns = ['user', 'requestedRole', 'reason', 'date', 'actions'];
  loading = true;

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadRoleRequests();
  }

  loadRoleRequests() {
    this.loading = true;
    this.adminService.getRoleRequests().subscribe({
      next: (requests) => {
        this.roleRequests = requests;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading role requests:', error);
        this.showSnackBar('Failed to load role requests');
        this.loading = false;
      }
    });
  }

  approveRequest(request: any) {
    const dialogRef = this.dialog.open(RoleRequestDialogComponent, {
      data: {
        title: 'Approve Role Request',
        message: `Are you sure you want to approve ${request.userFullName}'s request to become an ${request.requestedRole.toLowerCase()}?`,
        type: 'approve'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.approveRoleRequest(request.id, result.comment).subscribe({
          next: () => {
            this.roleRequests = this.roleRequests.filter(r => r.id !== request.id);
            this.showSnackBar('Role request approved successfully');
          },
          error: (error) => {
            console.error('Error approving role request:', error);
            this.showSnackBar('Failed to approve role request');
          }
        });
      }
    });
  }

  rejectRequest(request: any) {
    const dialogRef = this.dialog.open(RoleRequestDialogComponent, {
      data: {
        title: 'Reject Role Request',
        message: `Are you sure you want to reject ${request.userFullName}'s request?`,
        type: 'reject'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.rejectRoleRequest(request.id, result.comment).subscribe({
          next: () => {
            this.roleRequests = this.roleRequests.filter(r => r.id !== request.id);
            this.showSnackBar('Role request rejected successfully');
          },
          error: (error) => {
            console.error('Error rejecting role request:', error);
            this.showSnackBar('Failed to reject role request');
          }
        });
      }
    });
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
} 