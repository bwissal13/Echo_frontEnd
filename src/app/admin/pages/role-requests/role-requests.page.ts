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
        </div>

        <div class="table-container">
          <table mat-table [dataSource]="roleRequests">
            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef>User</th>
              <td mat-cell *matCellDef="let request">
                {{ request.userFullName }}
                <div class="user-email">{{ request.userEmail }}</div>
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
              <td mat-cell *matCellDef="let request">
                {{ request.reason }}
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let request">
                {{ request.createdAt | date:'medium' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let request">
                <button mat-button color="primary" (click)="approveRequest(request)">
                  <mat-icon>check_circle</mat-icon>
                  Approve
                </button>
                <button mat-button color="warn" (click)="rejectRequest(request)">
                  <mat-icon>cancel</mat-icon>
                  Reject
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <!-- No Data Row -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell empty-row" [attr.colspan]="displayedColumns.length">
                No pending role requests
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
        font-size: 32px;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0;
      }
    }

    .table-container {
      background: white;
      border-radius: 12px;
      border: 1px solid #eee;
      overflow: hidden;

      table {
        width: 100%;
      }

      th {
        background: #f8f9fa;
        color: #666;
        font-weight: 500;
        font-size: 14px;
      }

      td {
        font-size: 14px;
      }
    }

    .user-email {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }

    .role-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;

      &.author {
        background: #e0e7ff;
        color: #4f46e5;
      }
    }

    .empty-row {
      padding: 16px;
      text-align: center;
      color: #666;
    }

    button {
      mat-icon {
        margin-right: 8px;
      }
    }
  `]
})
export class RoleRequestsPage implements OnInit {
  roleRequests: any[] = [];
  displayedColumns = ['user', 'requestedRole', 'reason', 'date', 'actions'];

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadRoleRequests();
  }

  loadRoleRequests() {
    this.adminService.getRoleRequests().subscribe({
      next: (requests) => {
        this.roleRequests = requests;
      },
      error: (error) => {
        console.error('Error loading role requests:', error);
        this.showSnackBar('Failed to load role requests');
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