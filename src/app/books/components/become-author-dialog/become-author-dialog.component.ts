import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-become-author-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>Become an Author</h2>
    <form [formGroup]="authorRequestForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <p>To create and publish books, you need to become an author first.</p>
        <p>Please tell us why you want to become an author:</p>
        <mat-form-field appearance="outline" class="full-width">
          <textarea
            matInput
            formControlName="reason"
            placeholder="Your reason..."
            rows="4"
          ></textarea>
          <mat-error *ngIf="authorRequestForm.get('reason')?.hasError('required')">
            Please provide a reason
          </mat-error>
          <mat-error *ngIf="authorRequestForm.get('reason')?.hasError('minlength')">
            Please provide at least 20 characters
          </mat-error>
        </mat-form-field>
        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close type="button">Cancel</button>
        <button 
          mat-raised-button 
          color="primary" 
          type="submit"
          [disabled]="authorRequestForm.invalid || isSubmitting"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    .error-message {
      color: #f44336;
      font-size: 12px;
      margin-top: 8px;
    }
  `]
})
export class BecomeAuthorDialogComponent {
  authorRequestForm: FormGroup;
  isSubmitting = false;
  errorMessage: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<BecomeAuthorDialogComponent>,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.authorRequestForm = this.formBuilder.group({
      reason: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  onSubmit(): void {
    if (this.authorRequestForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    const reason = this.authorRequestForm.get('reason')?.value;
    
    console.log('Submitting author request with reason:', reason);

    this.authService.requestAuthorRole(reason).subscribe({
      next: (response) => {
        console.log('Author request response:', response);
        this.isSubmitting = false;
        if (response.status === 'APPROVED') {
          this.snackBar.open('Your request was approved! You are now an author.', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
          window.location.reload();
        } else {
          this.snackBar.open('Your request has been submitted and is pending review.', 'Close', {
            duration: 5000,
            panelClass: ['info-snackbar']
          });
          this.dialogRef.close('pending');
        }
      },
      error: (error) => {
        console.error('Author request error:', error);
        this.isSubmitting = false;
        this.errorMessage = error.message || 'Failed to submit request';
        this.snackBar.open(
          this.errorMessage ?? 'An error occurred',
          'Close',
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }
} 