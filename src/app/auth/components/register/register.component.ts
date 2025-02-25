import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RegisterData } from '../../models/auth.interface';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCheckboxModule
  ]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  errorMessage = '';
  acceptTerms = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      firstname: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      lastname: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {}

  passwordMatchValidator(control: AbstractControl): {[key: string]: boolean} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password?.pristine || confirmPassword?.pristine) {
      return null;
    }

    return password && confirmPassword && password.value !== confirmPassword.value ? 
      { 'misMatch': true } : null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const { confirmPassword, acceptTerms, ...formData } = this.registerForm.value;
      
      // Transform the data to match backend format
      const registerData: RegisterData = {
        email: formData.email.toLowerCase().trim(),
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        password: formData.password
      };
      
      console.log('Form data being sent:', registerData);
      
      this.authService.register(registerData).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.snackBar.open('Registration successful! Please check your email for verification code.', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/auth/verify-email'], {
            queryParams: { email: registerData.email }
          });
        },
        error: (error: string) => {
          this.loading = false;
          this.errorMessage = error;
          console.error('Registration error:', error);
          this.snackBar.open(error, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.registerForm);
      console.log('Form validation errors:', this.registerForm.errors);
      console.log('Form values:', this.registerForm.value);
      console.log('Form status:', this.registerForm.status);
      
      // Show validation errors to user
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.errors) {
          console.log(`${key} errors:`, control.errors);
          const errorMessage = this.getErrorMessage(key);
          if (errorMessage) {
            this.snackBar.open(errorMessage, 'Close', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['error-snackbar']
            });
          }
        }
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (control?.hasError('required')) {
      switch (controlName) {
        case 'firstname':
          return 'Firstname is required';
        case 'lastname':
          return 'Lastname is required';
        case 'email':
          return 'Email is required';
        case 'password':
          return 'Password is required';
        default:
          return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
      }
    }
    if (control?.hasError('email')) {
      return 'Invalid email format';
    }
    if (control?.hasError('minlength')) {
      switch (controlName) {
        case 'firstname':
        case 'lastname':
          return 'Name must be at least 2 characters long';
        case 'password':
          return 'Password must be at least 6 characters long';
      }
    }
    if (control?.hasError('maxlength')) {
      return 'Maximum 50 characters allowed';
    }
    if (this.registerForm.hasError('misMatch') && controlName === 'confirmPassword') {
      return 'Passwords do not match';
    }
    if (controlName === 'acceptTerms' && control?.hasError('required')) {
      return 'You must accept the terms and conditions';
    }
    return '';
  }
} 