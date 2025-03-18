import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { BookService } from '../../services/book.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Book } from '../../models/book.interface';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { BookCardComponent } from '../../../shared/components/book-card/book-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    SidebarComponent,
    SearchBarComponent,
    BookCardComponent,
    EmptyStateComponent,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    BackButtonComponent
  ],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss']
})
export class BookListComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  books: Book[] = [];
  loading = false;
  error: string | null = null;
  isAuthor = false;
  selectedBookId: number | null = null;
  
  // Pagination properties
  currentPage = 0;
  pageSize = 12;
  totalBooks = 0;
  pageSizeOptions = [12, 24, 36, 48];
  searchQuery = '';
  searchGenre: string = '';
  searchAuthorName: string = '';

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

    console.log('Loading books with:', {
      query: this.searchQuery,
      genre: this.searchGenre,
      authorName: this.searchAuthorName
    });

    // Get current user from Auth Service
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        const userId = user?.id;
        
        if (this.searchQuery || this.searchGenre || this.searchAuthorName) {
          // Use advanced search
          console.log('Calling searchBooks with:', {
            query: this.searchQuery,
            page: this.currentPage,
            size: this.pageSize,
            userId: userId,
            genre: this.searchGenre,
            authorName: this.searchAuthorName
          });
          
          this.bookService.searchBooks(
            this.searchQuery,
            this.currentPage, 
            this.pageSize, 
            userId,
            this.searchGenre,
            this.searchAuthorName
          ).subscribe({
            next: (response) => {
              console.log('Books searched:', response);
              this.books = response.content;
              this.totalBooks = response.totalElements;
              this.loading = false;
            },
            error: (error) => {
              console.error('Error searching books:', error);
              this.error = error.message || 'Failed to search books';
              this.loading = false;
            }
          });
        } else {
          // Regular books loading
          this.bookService.getMyBooks(this.currentPage, this.pageSize).subscribe({
            next: (response) => {
              console.log('Books loaded:', response);
              this.books = response.content;
              this.totalBooks = response.totalElements;
              this.loading = false;
            },
            error: (error) => {
              console.error('Error loading books:', error);
              this.error = error.message || 'Failed to load books';
              this.loading = false;
            }
          });
        }
      },
      error: (error) => {
        console.error('Error getting current user:', error);
        this.error = 'Failed to authenticate user';
        this.loading = false;
      }
    });
  }

  onSearch(searchData: any) {
    console.log('BookListComponent received search data:', searchData);
    
    // If string is passed, it's a simple search query
    if (typeof searchData === 'string') {
      this.searchQuery = searchData;
      this.currentPage = 0;
      this.loadBooks();
      return;
    }
    
    // Otherwise it's an advanced search with multiple fields
    this.searchQuery = searchData.query || '';
    this.searchGenre = searchData.genre || '';
    this.searchAuthorName = searchData.authorName || '';
    
    console.log('Updated search parameters:', {
      query: this.searchQuery,
      genre: this.searchGenre,
      authorName: this.searchAuthorName
    });
    
    this.currentPage = 0;
    this.loadBooks();
  }

  onPageChange(event: PageEvent) {
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