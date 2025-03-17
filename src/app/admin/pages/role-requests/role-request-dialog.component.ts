import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-role-request-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Comment</mat-label>
        <textarea
          matInput
          [(ngModel)]="comment"
          placeholder="Add a comment..."
          rows="4">
        </textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button 
        mat-raised-button
        [color]="data.type === 'approve' ? 'primary' : 'warn'"
        (click)="onConfirm()"
        [disabled]="!comment">
        {{ data.type === 'approve' ? 'Approve' : 'Reject' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      min-width: 300px;
    }
  `]
})
export class RoleRequestDialogComponent {
  comment = '';

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