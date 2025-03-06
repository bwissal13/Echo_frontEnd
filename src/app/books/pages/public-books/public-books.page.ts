import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-public-books',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatPaginatorModule,
    SidebarComponent,
    SearchBarComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  templateUrl: './public-books.page.html',
  styleUrls: ['./public-books.page.scss']
})
export class PublicBooksPage implements OnInit {
  books: any[] = [];
  loading = false;
  error = '';
  currentPage = 0;
  pageSize = 12;
  totalBooks = 0;
  currentFilter = 'all';
  searchQuery = '';

  constructor(
    private bookService: BookService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.loading = true;
    this.error = '';

    this.bookService.getPublicBooks(
      this.currentPage,
      this.pageSize,
      this.currentFilter,
      this.searchQuery
    ).subscribe({
      next: (response) => {
        if (response && response.content) {
          this.books = response.content;
          this.totalBooks = response.totalElements;
        } else {
          this.books = [];
          this.totalBooks = 0;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading books:', err);
        this.loading = false;
        
        if (err.status === 403) {
          this.error = 'You do not have permission to view these books. Please log in or check your access rights.';
        } else if (err.status === 401) {
          this.error = 'Please log in to view books.';
        } else if (err.error?.message) {
          this.error = err.error.message;
        } else {
          this.error = 'Failed to load books. Please try again.';
        }
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBooks();
  }

  filterBooks(filter: string) {
    this.currentFilter = filter;
    this.currentPage = 0;
    this.loadBooks();
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.currentPage = 0;
    this.loadBooks();
  }

  navigateToBook(bookId: string) {
    this.router.navigate(['/books/public', bookId]);
  }

  getBookCoverUrl(coverImage: string | null): string {
    return this.bookService.getBookCoverUrl(coverImage);
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/default-book-cover.jpg';
  }
} 