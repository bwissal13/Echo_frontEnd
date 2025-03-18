import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-role-request-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <h2 class="dialog-title">{{ data.title }}</h2>
      
      <p class="dialog-message">{{ data.message }}</p>
      
      <div class="textarea-container" [class.focused]="isFocused">
        <label class="textarea-label">Comment</label>
        <div class="textarea-wrapper">
          <textarea
            [(ngModel)]="comment"
            placeholder="Add a comment explaining your decision..."
            rows="4"
            (focus)="isFocused = true"
            (blur)="isFocused = false">
          </textarea>
          <div class="char-count" [class.has-content]="comment.length > 0">
            {{ comment.length }} characters
          </div>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button 
          class="cancel-button" 
          (click)="onCancel()">
          Cancel
        </button>
        <button 
          class="action-button"
          [class.approve]="data.type === 'approve'"
          [class.reject]="data.type === 'reject'"
          (click)="onConfirm()"
          [disabled]="!comment">
          <mat-icon>{{ data.type === 'approve' ? 'check_circle' : 'cancel' }}</mat-icon>
          {{ data.type === 'approve' ? 'Approve' : 'Reject' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 8px 8px 16px 8px;
      min-width: 400px;
      max-width: 500px;
    }

    .dialog-title {
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 16px 0;
    }

    .dialog-message {
      font-size: 15px;
      line-height: 1.5;
      color: #4b5563;
      margin-bottom: 24px;
    }

    .textarea-container {
      margin-bottom: 24px;
    }

    .textarea-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #4b5563;
      margin-bottom: 8px;
    }

    .textarea-wrapper {
      position: relative;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      transition: all 0.2s ease;
      background: #f9fafb;
      overflow: hidden;

      &:hover {
        border-color: #d1d5db;
      }
    }

    .textarea-container.focused .textarea-wrapper {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      background: white;
    }

    textarea {
      width: 100%;
      padding: 16px;
      padding-bottom: 36px;
      border: none;
      background: transparent;
      font-family: inherit;
      font-size: 15px;
      line-height: 1.5;
      color: #374151;
      resize: vertical;
      min-height: 120px;
      outline: none;

      &::placeholder {
        color: #9ca3af;
      }
    }

    .char-count {
      position: absolute;
      bottom: 10px;
      right: 16px;
      font-size: 12px;
      color: #9ca3af;
      font-weight: 500;
      transition: color 0.2s ease;

      &.has-content {
        color: #4b5563;
      }
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }

    .cancel-button {
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      background: white;
      color: #4b5563;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #f9fafb;
        border-color: #d1d5db;
      }
    }

    .action-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &.approve {
        background: #4f46e5;
        color: white;

        &:hover:not(:disabled) {
          background: #4338ca;
        }
      }

      &.reject {
        background: #ef4444;
        color: white;

        &:hover:not(:disabled) {
          background: #dc2626;
        }
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }
  `]
})
export class RoleRequestDialogComponent {
  comment = '';
  isFocused = false;

  constructor(
    public dialogRef: MatDialogRef<RoleRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm(): void {
    this.dialogRef.close({ comment: this.comment });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 