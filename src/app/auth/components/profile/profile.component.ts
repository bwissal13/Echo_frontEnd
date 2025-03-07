import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.interface';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

interface UserBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  dateAdded: Date;
}

interface UserPhrase {
  id: string;
  content: string;
  bookTitle: string;
  dateAdded: Date;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTabsModule
  ]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  user: User | null = null;
  errorMessage = '';

  userBooks: UserBook[] = [];
  recentPhrases: UserPhrase[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      bio: ['', Validators.maxLength(500)],
      profilePicture: ['']
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          bio: user.bio || '',
          profilePicture: user.profilePicture || ''
        });
        this.loading = false;
        
        // Load user's books and phrases
        this.loadUserBooks();
        this.loadRecentPhrases();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load profile';
        this.snackBar.open(this.errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      const updatedProfile = this.profileForm.value;
      
      // TODO: Implement profile update in AuthService
      this.authService.updateProfile(updatedProfile).subscribe({
        next: (response) => {
          this.snackBar.open('Profile updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to update profile';
          this.snackBar.open(this.errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.profileForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('maxlength')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} cannot exceed ${control.errors?.['maxlength'].requiredLength} characters`;
    }
    return '';
  }

  private loadUserBooks() {
    // Implement this method to load user's books from your service
  }

  private loadRecentPhrases() {
    // Implement this method to load user's recent phrases from your service
  }
} 