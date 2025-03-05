import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Book } from '../../books/models/book.interface';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../auth/services/auth.service';

export interface BookmarkGroup {
  id: number;
  name: string;
  books: Book[];
  createdAt: Date;
}

export interface CreateBookmarkGroupRequest {
  name: string;
}

export interface AddToBookmarkRequest {
  bookId: number;
  groupId: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  private apiUrl = `${environment.apiUrl}/api/v1/bookmarks`;
  private bookmarkedBooksSubject = new BehaviorSubject<Set<number>>(new Set());
  bookmarkedBooks$ = this.bookmarkedBooksSubject.asObservable();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.loadBookmarkedBooks();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getBookmarkGroups(): Observable<BookmarkGroup[]> {
    return this.http.get<{ content: BookmarkGroup[] }>(`${this.apiUrl}/groups`, { headers: this.getHeaders() })
      .pipe(
        map(response => response.content || []),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Please login to access bookmarks';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    return throwError(() => errorMessage);
  }

  private loadBookmarkedBooks() {
    this.getBookmarkGroups().subscribe({
      next: (groups) => {
        const bookIds = new Set<number>();
        if (Array.isArray(groups)) {
          groups.forEach(group => {
            group.books.forEach(book => bookIds.add(book.id));
          });
        }
        this.bookmarkedBooksSubject.next(bookIds);
      },
      error: () => {
        this.bookmarkedBooksSubject.next(new Set());
      }
    });
  }

  createBookmarkGroup(request: CreateBookmarkGroupRequest): Observable<BookmarkGroup> {
    return this.http.post<BookmarkGroup>(
      `${this.apiUrl}/groups`, 
      request, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  addToBookmark(request: AddToBookmarkRequest): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/add`, 
      request, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  removeFromBookmark(bookId: number, groupId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/groups/${groupId}/books/${bookId}`, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  isBookmarked(bookId: number): boolean {
    return this.bookmarkedBooksSubject.value.has(bookId);
  }
} 