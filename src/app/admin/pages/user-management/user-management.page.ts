import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { AdminService } from '../../services/admin.service';
import { User } from '../../../auth/models/auth.interface';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    SidebarComponent,
    SearchBarComponent
  ],
  template: `
    <div class="app-container">
      <app-sidebar></app-sidebar>
      
      <div class="main-content">
        <div class="page-header">
          <h1>User Management</h1>
          <app-search-bar (search)="onSearch($event)"></app-search-bar>
        </div>

        <div class="table-container">
          <table mat-table [dataSource]="users">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let user">
                {{ user.firstname }} {{ user.lastname }}
              </td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let user">{{ user.email }}</td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let user">
                <span class="role-badge" [class]="user.role.toLowerCase()">
                  {{ user.role }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let user">
                <span class="status-badge" [class.active]="user.enabled">
                  {{ user.enabled ? 'Active' : 'Disabled' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let user">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item [matMenuTriggerFor]="roleMenu">
                    <mat-icon>person</mat-icon>
                    <span>Change Role</span>
                  </button>
                  <button mat-menu-item (click)="toggleUserStatus(user)">
                    <mat-icon>{{ user.enabled ? 'block' : 'check_circle' }}</mat-icon>
                    <span>{{ user.enabled ? 'Disable' : 'Enable' }}</span>
                  </button>
                  <button mat-menu-item (click)="deleteUser(user)">
                    <mat-icon>delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
                <mat-menu #roleMenu="matMenu">
                  <button mat-menu-item (click)="updateUserRole(user, 'USER')">
                    <span>User</span>
                  </button>
                  <button mat-menu-item (click)="updateUserRole(user, 'AUTHOR')">
                    <span>Author</span>
                  </button>
                  <button mat-menu-item (click)="updateUserRole(user, 'ADMIN')">
                    <span>Admin</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator
            [length]="totalUsers"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25, 100]"
            (page)="onPageChange($event)">
          </mat-paginator>
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
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .role-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;

      &.admin {
        background: #fee2e2;
        color: #dc2626;
      }

      &.author {
        background: #e0e7ff;
        color: #4f46e5;
      }

      &.user {
        background: #f3f4f6;
        color: #4b5563;
      }
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      background: #f3f4f6;
      color: #4b5563;

      &.active {
        background: #dcfce7;
        color: #16a34a;
      }
    }

    mat-paginator {
      border-top: 1px solid #eee;
    }
  `]
})
export class UserManagementPage implements OnInit {
  users: User[] = [];
  displayedColumns = ['name', 'email', 'role', 'status', 'actions'];
  totalUsers = 0;
  pageSize = 10;
  currentPage = 0;
  searchQuery = '';

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getUsers(this.currentPage, this.pageSize, this.searchQuery)
      .subscribe({
        next: (response) => {
          this.users = response.content;
          this.totalUsers = response.totalElements;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.showSnackBar('Failed to load users');
        }
      });
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.currentPage = 0;
    this.loadUsers();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  updateUserRole(user: User, newRole: string) {
    this.adminService.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        user.role = newRole;
        this.showSnackBar('User role updated successfully');
      },
      error: (error) => {
        console.error('Error updating user role:', error);
        this.showSnackBar('Failed to update user role');
      }
    });
  }

  toggleUserStatus(user: User) {
    this.adminService.updateUserStatus(user.id, !user.enabled).subscribe({
      next: () => {
        user.enabled = !user.enabled;
        this.showSnackBar(`User ${user.enabled ? 'enabled' : 'disabled'} successfully`);
      },
      error: (error) => {
        console.error('Error updating user status:', error);
        this.showSnackBar('Failed to update user status');
      }
    });
  }

  deleteUser(user: User) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.firstname} ${user.lastname}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteUser(user.id).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.id !== user.id);
            this.showSnackBar('User deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.showSnackBar('Failed to delete user');
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