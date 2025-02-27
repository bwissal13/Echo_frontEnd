import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="min-h-screen bg-gray-100">
      <!-- Top Navigation Bar -->
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center space-x-4">
              <div class="text-xl font-semibold text-gray-800">
                Echo Dashboard
              </div>
              <a routerLink="/books" 
                 class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                My Books
              </a>
            </div>
            <div class="flex items-center">
              <button mat-button (click)="logout()" class="text-gray-600 hover:text-gray-900">
                <mat-icon class="mr-2">exit_to_app</mat-icon>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a routerLink="/books" 
                 class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 class="font-medium">View All Books</h3>
                <p class="text-sm text-gray-500">Browse and manage your books</p>
              </a>
              <a routerLink="/books/new" 
                 class="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 class="font-medium">Create New Book</h3>
                <p class="text-sm text-gray-500">Start writing a new book</p>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class DashboardComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
} 