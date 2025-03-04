import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { BookService } from '../../services/book.service';
import { AuthService } from '../../../auth/services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Book } from '../../models/book.interface';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="book-container">
      <!-- Left Sidebar -->
      <aside class="sidebar">
        <div class="menu-items">
          <a routerLink="/dashboard" class="menu-item" routerLinkActive="active">
            <mat-icon>home</mat-icon>
            <span>Home</span>
          </a>
          <a routerLink="/books" class="menu-item" routerLinkActive="active">
            <mat-icon>library_books</mat-icon>
            <span>My Books</span>
          </a>
          <a routerLink="/books/recent" class="menu-item" routerLinkActive="active">
            <mat-icon>history</mat-icon>
            <span>Recent</span>
          </a>
          <a routerLink="/books/bookmarks" class="menu-item" routerLinkActive="active">
            <mat-icon>bookmark</mat-icon>
            <span>Bookmarks</span>
          </a>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <div class="flex justify-between items-center mb-6">
          <div class="search-bar flex-1 mr-4">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Search book name, author, edition...">
          </div>
          <button mat-raised-button color="primary" (click)="fileInput.click()" *ngIf="isAuthor">
            <mat-icon>image</mat-icon>
            Change Cover
          </button>
          <input #fileInput type="file" hidden (change)="onFileSelected($event)" accept="image/*">
        </div>

        <!-- Loading spinner -->
        <mat-spinner *ngIf="loading" diameter="40" class="loading-spinner"></mat-spinner>

        <!-- Error message -->
        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>

        <!-- Books grid -->
        <div class="book-grid" *ngIf="!loading && !error && books.length > 0">
          <mat-card *ngFor="let book of books" class="book-card" [routerLink]="['/books/edit', book.id]" (click)="selectBook(book, $event)">
            <img [src]="getImageUrl(book.coverImage)" [alt]="book.title">
            <div class="book-info">
              <h3>{{book.title}}</h3>
              <p>{{book.genre}}</p>
              <div class="book-actions">
                <button mat-icon-button (click)="$event.stopPropagation()">
                  <mat-icon>bookmark</mat-icon>
                </button>
                <button mat-icon-button (click)="$event.stopPropagation()">
                  <mat-icon>share</mat-icon>
                </button>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Empty state -->
        <div *ngIf="!loading && !error && books.length === 0" class="empty-state">
          <mat-icon>library_books</mat-icon>
          <h3>No books yet</h3>
          <p>Start writing your first book!</p>
          <button mat-raised-button color="primary" routerLink="/books/new" *ngIf="isAuthor">
            <mat-icon>add</mat-icon>
            New Book
          </button>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['./book-list.component.scss'],
  styles: [`
    .menu-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      &.active {
        background-color: rgba(0, 0, 0, 0.08);
      }

      mat-icon {
        margin-right: 12px;
      }
    }
  `]
})
export class BookListComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  books: Book[] = [];
  loading = false;
  error: string | null = null;
  isAuthor = false;
  selectedBookId: number | null = null;
  
  // Pagination
  currentPage = 0;
  pageSize = 12;
  totalBooks = 0;
  totalPages = 0;

  private readonly API_URL = 'http://localhost:8080';

  constructor(
    private bookService: BookService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isAuthor = this.authService.hasRole('AUTHOR');
    this.loadBooks();
  }

  loadBooks() {
    this.loading = true;
    this.error = null;

    this.bookService.getMyBooks(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        console.log('Books loaded:', response);
        this.books = response.content;
        this.totalBooks = response.totalElements;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.error = error.message || 'Failed to load books';
        this.loading = false;
      }
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBooks();
  }

  getImageUrl(coverImage: string | null): string {
    return this.bookService.getImageUrl(coverImage);
  }

  selectBook(book: Book, event: Event): void {
    event.stopPropagation();
    this.selectedBookId = book.id;
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.selectedBookId) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      this.error = 'Please select an image file';
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.error = 'Image size should be less than 5MB';
      return;
    }

    this.loading = true;
    this.error = null;

    this.bookService.uploadCoverImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          this.updateBookCover(response.url);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.error = error.message || 'Failed to upload image';
        this.loading = false;
      }
    });
  }

  private updateBookCover(imageUrl: string): void {
    if (this.selectedBookId) {
      const updateData = {
        coverImage: imageUrl
      };
      
      this.bookService.updateBook(this.selectedBookId, updateData).subscribe({
        next: () => {
          this.loadBooks();
          this.selectedBookId = null;
        },
        error: (error) => {
          console.error('Error updating book cover:', error);
          this.error = error.message || 'Failed to update book cover';
        }
      });
    }
  }
} 