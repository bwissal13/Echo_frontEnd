import { Component, OnInit } from '@angular/core';
import { BookService } from '../../services/book.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Book, BookPage } from '../../models/book.interface';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.scss']
})
export class BooksListComponent implements OnInit {
  books: Book[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 0;
  pageSize = 10;
  totalBooks = 0;
  isAuthor = false;

  constructor(
    private bookService: BookService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAuthor = this.authService.hasRole('AUTHOR');
    this.loadMyBooks();
  }

  loadMyBooks(): void {
    this.loading = true;
    this.error = null;

    this.bookService.getMyBooks(this.currentPage, this.pageSize).subscribe({
      next: (response: BookPage) => {
        console.log('Books loaded:', response);
        this.books = response.content;
        this.totalBooks = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.error = error.message || 'Failed to load books';
        this.loading = false;
        this.snackBar.open(this.error, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadMyBooks();
  }

  getStatusLabel(book: Book): string {
    return book.isPublic ? 'Published' : 'Draft';
  }
} 