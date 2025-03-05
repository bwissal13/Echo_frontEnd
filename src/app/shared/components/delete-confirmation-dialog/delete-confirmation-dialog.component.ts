import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-delete-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="delete-dialog">
      <div class="dialog-header" [class.warning]="data.isPermanent">
        <mat-icon>{{ data.isPermanent ? 'warning' : 'delete_outline' }}</mat-icon>
        <h2 mat-dialog-title>{{ data.title }}</h2>
      </div>
      
      <mat-dialog-content>
        <p>{{ data.message }}</p>
        <div class="warning-text" *ngIf="data.isPermanent">
          This action cannot be undone.
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close(false)">
          Cancel
        </button>
        <button 
          mat-flat-button
          [color]="data.isPermanent ? 'warn' : 'primary'"
          (click)="dialogRef.close(true)">
          {{ data.confirmText }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .delete-dialog {
      padding: 24px;
      max-width: 400px;
    }
    
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      
      &.warning {
        color: #d32f2f;
        
        .mat-icon {
          color: #d32f2f;
        }
      }
      
      .mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }
    
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    
    .warning-text {
      margin-top: 16px;
      color: #d32f2f;
      font-size: 14px;
    }
    
    mat-dialog-actions {
      margin-top: 24px;
      padding: 0;
    }
  `]
})
export class DeleteConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      message: string;
      confirmText: string;
      isPermanent: boolean;
    }
  ) {}
} 