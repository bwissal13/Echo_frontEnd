import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../services/auth.service';
import { Role, RoleChangeRequest, RoleChangeResponse } from '../../models/auth.interface';

interface RoleRequest {
  id: number;
  requestedRole: Role;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminComment?: string;
  adminResponse?: string;
  createdAt: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-role-request',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    SidebarComponent
  ],
  template: `
    <div class="app-container">
      <app-sidebar></app-sidebar>
      
      <div class="main-content">
        <div class="form-container">
          <div class="form-header">
            <h1>Request Role Change</h1>
            <p>Request to upgrade your account permissions</p>
          </div>

          <form (ngSubmit)="submitRequest()" #roleForm="ngForm" class="role-form">
            <mat-form-field appearance="outline">
              <mat-label>Requested Role</mat-label>
              <mat-select [(ngModel)]="requestedRole" name="role" required>
                <mat-option [value]="Role.AUTHOR">Author</mat-option>
                <mat-option [value]="Role.ADMIN">Admin</mat-option>
              </mat-select>
              <mat-hint>Select the role you'd like to request</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Reason for Request</mat-label>
              <textarea 
                matInput 
                [(ngModel)]="reason" 
                name="reason" 
                required
                minlength="20"
                #reasonInput="ngModel"
                rows="5"
                placeholder="Please explain why you're requesting this role change...">
              </textarea>
              <mat-hint align="end">{{reason.length}} / 20 min characters</mat-hint>
              <mat-error *ngIf="reasonInput.hasError('required')">
                Please provide a reason for your request
              </mat-error>
              <mat-error *ngIf="reasonInput.hasError('minlength')">
                Reason must be at least 20 characters long
              </mat-error>
            </mat-form-field>

            <button 
              mat-flat-button 
              type="submit"
              class="submit-button"
              [disabled]="!roleForm.form.valid || loading">
              <mat-icon>send</mat-icon>
              {{ loading ? 'Submitting...' : 'Submit Request' }}
            </button>
          </form>

          <mat-divider class="divider"></mat-divider>

          <div class="requests-section">
            <h2>My Requests</h2>
            
            <div *ngIf="loadingRequests" class="loading-message">
              <mat-spinner diameter="24" color="accent"></mat-spinner>
              Loading requests...
            </div>

            <div *ngIf="!loadingRequests && (!myRequests || myRequests.length === 0)" class="empty-state">
              <mat-icon>inbox</mat-icon>
              <p>No role requests found</p>
            </div>

            <div *ngIf="!loadingRequests && myRequests && myRequests.length > 0" class="requests-list">
              <div *ngFor="let request of myRequests" class="request-card">
                <div class="request-header">
                  <div class="role-badge" [ngClass]="request.requestedRole.toLowerCase()">
                    {{ request.requestedRole }}
                  </div>
                  <div class="status-badge" [ngClass]="request.status.toLowerCase()">
                    {{ request.status }}
                  </div>
                </div>

                <div class="request-body">
                  <div class="request-details">
                    <p class="request-reason">{{ request.reason }}</p>
                    <small class="request-date">Requested on: {{ request.createdAt | date:'medium' }}</small>
                  </div>

                  <div *ngIf="request.status !== 'PENDING'" class="admin-response" 
                       [ngClass]="request.status.toLowerCase()">
                    <h4>Admin Response:</h4>
                    <p>{{ request.adminComment || 'No comment provided' }}</p>
                    <small *ngIf="request.updatedAt">
                      Response date: {{ request.updatedAt | date:'medium' }}
                    </small>
                  </div>

                  <div *ngIf="request.status === 'PENDING'" class="pending-status">
                    <mat-icon>hourglass_empty</mat-icon>
                    <span>Awaiting admin review</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
      display: flex;
      justify-content: center;
      align-items: flex-start;
      width: 100%;
    }

    .form-container {
      background: white;
      border-radius: 16px;
      padding: 32px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 4px 6px -1px rgba(157, 138, 165, 0.1);
      border: 1px solid rgba(157, 138, 165, 0.1);
    }

    .form-header {
      text-align: center;
      margin-bottom: 32px;

      h1 {
        font-size: 24px;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0;
        margin-bottom: 8px;
      }

      p {
        color: #666;
        font-size: 14px;
        margin: 0;
      }
    }

    .role-form {
      display: flex;
      flex-direction: column;
      gap: 20px;

      mat-form-field {
        width: 100%;
      }

      textarea {
        min-height: 120px;
      }
    }

    .submit-button {
      background: linear-gradient(135deg, #9d8aa5, #7c6d85);
      color: white;
      padding: 8px 24px;
      border-radius: 8px;
      transition: all 0.2s ease;
      width: 100%;
      margin-top: 16px;

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #8a7991, #6a5c72);
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      mat-icon {
        margin-right: 8px;
      }
    }

    ::ng-deep {
      .mat-form-field-appearance-outline .mat-form-field-outline {
        color: rgba(157, 138, 165, 0.3);
      }

      .mat-form-field.mat-focused .mat-form-field-label {
        color: #7c6d85;
      }

      .mat-form-field.mat-focused .mat-form-field-outline-thick {
        color: #9d8aa5;
      }

      .mat-select-value, .mat-select-arrow {
        color: #1a1a1a;
      }
    }

    .divider {
      margin: 32px 0;
    }

    .requests-section {
      h2 {
        font-size: 20px;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0 0 24px;
      }
    }

    .loading-message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #666;
      padding: 24px;
    }

    .empty-state {
      text-align: center;
      color: #666;
      padding: 32px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px dashed rgba(157, 138, 165, 0.2);

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #9d8aa5;
        margin-bottom: 16px;
      }

      p {
        margin: 0;
        font-size: 16px;
      }
    }

    .requests-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .request-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      border: 1px solid rgba(157, 138, 165, 0.1);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .request-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .role-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;

      &.author {
        background: #e0e7ff;
        color: #4f46e5;
      }

      &.admin {
        background: #fef3c7;
        color: #d97706;
      }
    }

    .status-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;

      &.pending {
        background: #f3f4f6;
        color: #6b7280;
      }

      &.approved {
        background: #dcfce7;
        color: #16a34a;
      }

      &.rejected {
        background: #fee2e2;
        color: #dc2626;
      }
    }

    .request-body {
      .request-details {
        margin-bottom: 16px;

        .request-reason {
          margin: 0 0 8px;
          color: #374151;
        }

        .request-date {
          color: #6b7280;
          font-size: 12px;
        }
      }
    }

    .admin-response {
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;

      h4 {
        margin: 0 0 8px;
        font-size: 14px;
        font-weight: 500;
      }

      p {
        margin: 0 0 8px;
        color: #374151;
      }

      small {
        color: #6b7280;
        font-size: 12px;
      }

      &.approved {
        background: #f0fdf4;
        border: 1px solid #dcfce7;
      }

      &.rejected {
        background: #fef2f2;
        border: 1px solid #fee2e2;
      }
    }

    .pending-status {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6b7280;
      font-size: 14px;
      margin-top: 16px;
      padding: 12px;
      background: #f3f4f6;
      border-radius: 8px;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
  `]
})
export class RoleRequestPage implements OnInit {
  Role = Role;
  requestedRole: Role = Role.AUTHOR;
  reason: string = '';
  loading: boolean = false;
  loadingRequests: boolean = true;
  myRequests: RoleRequest[] = [];

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadMyRequests();
  }

  loadMyRequests() {
    this.loadingRequests = true;
    this.authService.getMyRoleRequests().subscribe({
      next: (requests) => {
        this.myRequests = requests;
        this.loadingRequests = false;
      },
      error: (error) => {
        console.error('Error loading role requests:', error);
        this.showMessage('Failed to load your role requests');
        this.loadingRequests = false;
      }
    });
  }

  submitRequest() {
    if (!this.reason.trim() || this.reason.length < 20) {
      this.showMessage('Please provide a detailed reason for your request (minimum 20 characters)');
      return;
    }

    this.loading = true;
    this.authService.requestRoleChange({
      requestedRole: this.requestedRole,
      reason: this.reason.trim()
    }).subscribe({
      next: (response: RoleChangeResponse) => {
        const message = response.status === 'APPROVED' 
          ? `Your request was approved! You are now a${this.requestedRole === Role.ADMIN ? 'n' : ''} ${this.requestedRole.toLowerCase()}.`
          : 'Role request submitted successfully. Pending approval.';
        this.showMessage(message);
        this.reason = '';
        this.loading = false;
        this.loadMyRequests();
      },
      error: (error: Error) => {
        console.error('Error submitting role request:', error);
        this.showMessage(error.message || 'Failed to submit role request. Please try again later.');
        this.loading = false;
      }
    });
  }

  private showMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: message.includes('approved') ? ['success-snackbar'] : undefined
    });
  }
} 