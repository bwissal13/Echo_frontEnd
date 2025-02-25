import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { timer } from 'rxjs';
import { AuthResponse } from '../../models/auth.interface';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ]
})
export class VerifyEmailComponent implements OnInit {
  verifyForm: FormGroup;
  loading = false;
  verified = false;
  error = false;
  errorMessage = '';
  email: string = '';
  resendDisabled = false;
  countdown = 60;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.verifyForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    if (!this.email) {
      this.error = true;
      this.errorMessage = 'Email address is missing';
      this.snackBar.open('Email address is missing', 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit(): void {
    if (this.verifyForm.valid && this.email) {
      this.loading = true;
      this.error = false;
      this.errorMessage = '';
      
      this.authService.verifyEmail({
        email: this.email,
        code: this.verifyForm.get('otp')?.value
      }).subscribe({
        next: (response: AuthResponse) => {
          this.verified = true;
          this.loading = false;
          this.snackBar.open('Email verified successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          });
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 3000);
        },
        error: (error: string) => {
          this.error = true;
          this.loading = false;
          this.errorMessage = error;
          this.snackBar.open(error || 'Validation failed. Please try again.', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
          if (error.toLowerCase().includes('invalid') || error.toLowerCase().includes('expired')) {
            this.verifyForm.get('otp')?.reset();
            this.verifyForm.get('otp')?.markAsPristine();
          }
        }
      });
    } else {
      Object.keys(this.verifyForm.controls).forEach(key => {
        const control = this.verifyForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  resendOTP(): void {
    if (!this.resendDisabled && this.email) {
      this.loading = true;
      this.authService.resendOtp(this.email).subscribe({
        next: () => {
          this.loading = false;
          this.startResendTimer();
          this.snackBar.open('Verification code resent successfully', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          });
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Failed to resend verification code', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  private startResendTimer(): void {
    this.resendDisabled = true;
    this.countdown = 60;
    const countdownTimer = timer(0, 1000).subscribe(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        this.resendDisabled = false;
        countdownTimer.unsubscribe();
      }
    });
  }

  getErrorMessage(): string {
    const otpControl = this.verifyForm.get('otp');
    if (otpControl?.hasError('required')) {
      return 'Verification code is required';
    }
    if (otpControl?.hasError('pattern')) {
      return 'Please enter a valid 6-digit verification code';
    }
    if (this.errorMessage) {
      return this.errorMessage;
    }
    return '';
  }
} 