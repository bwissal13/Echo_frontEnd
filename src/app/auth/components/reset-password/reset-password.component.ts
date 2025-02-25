import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { timer } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ]
})
export class ResetPasswordComponent implements OnInit {
  emailForm: FormGroup;
  resetPasswordForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  email: string = '';
  errorMessage = '';
  otpSent = false;
  resendDisabled = false;
  countdown = 60;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetPasswordForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    const emailParam = this.route.snapshot.queryParamMap.get('email');
    if (emailParam) {
      this.email = emailParam;
      this.emailForm.patchValue({ email: emailParam });
      this.otpSent = true;
    }
  }

  sendOTP(): void {
    if (this.emailForm.valid && !this.resendDisabled) {
      this.loading = true;
      const email = this.emailForm.get('email')?.value;
      
      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.loading = false;
          this.email = email;
          this.otpSent = true;
          this.startResendTimer();
        },
        error: (error: string) => {
          this.loading = false;
          this.snackBar.open(error || 'Failed to send verification code', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.email) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.resetPassword({
        email: this.email,
        code: this.resetPasswordForm.get('code')?.value,
        newPassword: this.resetPasswordForm.get('newPassword')?.value
      }).subscribe({
        next: (response) => {
          this.snackBar.open(response.message || 'Password reset successful!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          });
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },
        error: (error: string) => {
          this.loading = false;
          this.errorMessage = error;
          if (error.toLowerCase().includes('invalid') || error.toLowerCase().includes('expired')) {
            this.resetPasswordForm.get('code')?.reset();
            this.resetPasswordForm.get('code')?.markAsPristine();
          }
          this.snackBar.open(error || 'Password reset failed. Please try again.', 'Close', {
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

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { misMatch: true };
  }

  getErrorMessage(controlName: string): string {
    if (controlName === 'email') {
      const control = this.emailForm.get('email');
      if (control?.hasError('required')) {
        return 'Email is required';
      }
      if (control?.hasError('email')) {
        return 'Please enter a valid email address';
      }
    }
    const control = this.resetPasswordForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    }
    if (controlName === 'code' && control?.hasError('pattern')) {
      return 'Please enter a valid 6-digit verification code';
    }
    if (controlName === 'newPassword' && control?.hasError('minlength')) {
      return 'Password must be at least 6 characters long';
    }
    if (this.resetPasswordForm.hasError('misMatch') && controlName === 'confirmPassword') {
      return 'Passwords do not match';
    }
    return '';
  }
} 