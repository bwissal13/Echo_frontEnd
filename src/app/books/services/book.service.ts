import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Book, CreateBookRequest, UpdateBookRequest, BookPage, Chapter, CreateChapterRequest, UpdateChapterRequest } from '../models/book.interface';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly API_URL = 'http://localhost:8080/api/v1/books';
  private readonly FILE_API_URL = 'http://localhost:8080/api/v1/files';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getBooks(page: number = 0, size: number = 12): Observable<BookPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'updatedAt,desc');  // Sort by last updated

    return this.http.get<BookPage>(`${this.API_URL}`, { 
      headers: this.getHeaders(),
      params 
    }).pipe(
      tap(response => console.log('Books response:', response)),
      catchError(error => {
        console.error('Error fetching books:', error);
        return throwError(() => new Error('Failed to fetch books'));
      })
    );
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.API_URL}/${id}`, { headers: this.getHeaders() });
  }

  getMyBooks(page: number = 0, size: number = 12): Observable<BookPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'updatedAt,desc');

    return this.http.get<BookPage>(`${this.API_URL}/me`, { 
      headers: this.getHeaders(),
      params 
    }).pipe(
      tap(response => console.log('My books response:', response)),
      catchError(error => {
        console.error('Error fetching my books:', error);
        return throwError(() => new Error('Failed to fetch your books'));
      })
    );
  }

  getPublicBooks(page: number = 0, size: number = 10): Observable<BookPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'createdAt,desc');

    return this.http.get<BookPage>(`${this.API_URL}/public`, { params });
  }

  searchBooks(query: string, page: number = 0, size: number = 10): Observable<BookPage> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<BookPage>(`${this.API_URL}/search`, { params });
  }

  createBook(book: CreateBookRequest): Observable<Book> {
    return this.http.post<Book>(this.API_URL, book, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error creating book:', error);
        if (error.status === 403) {
          return throwError(() => new Error('You do not have permission to create books'));
        }
        return throwError(() => new Error('Failed to create book'));
      })
    );
  }

  updateBook(id: number, book: UpdateBookRequest): Observable<Book> {
    return this.http.put<Book>(`${this.API_URL}/${id}`, book, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error updating book:', error);
        if (error.status === 403) {
          return throwError(() => new Error('You do not have permission to update this book'));
        }
        return throwError(() => new Error('Failed to update book'));
      })
    );
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  uploadCoverImage(file: File): Observable<{url: string}> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<{url: string}>(`${this.FILE_API_URL}/upload`, formData).pipe(
      tap(response => {
        console.log('Upload response:', response);
        if (!response?.url) {
          throw new Error('Invalid response format: missing URL');
        }
      }),
      catchError(error => {
        console.error('Upload error:', error);
        if (error.status === 403) {
          return throwError(() => new Error('You do not have permission to upload files'));
        }
        if (error.status === 413) {
          return throwError(() => new Error('File size too large'));
        }
        return throwError(() => new Error('Failed to upload image'));
      })
    );
  }

  getImageUrl(coverImage: string | null): string {
    if (!coverImage) {
      return 'assets/images/default-book-cover.jpg';
    }
    return coverImage.startsWith('http') 
      ? coverImage 
      : `${this.FILE_API_URL}${coverImage}`;
  }

  uploadImage(file: File): Observable<{url: string}> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<{url: string}>(`${environment.apiUrl}/api/v1/files/upload`, formData);
  }

  getChapters(bookId: number): Observable<Chapter[]> {
    return this.http.get<Chapter[]>(`${this.API_URL}/${bookId}/chapters`);
  }

  getChapter(bookId: number, chapterId: number): Observable<Chapter> {
    return this.http.get<Chapter>(`${this.API_URL}/${bookId}/chapters/${chapterId}`);
  }

  createChapter(bookId: number, chapter: CreateChapterRequest): Observable<Chapter> {
    return this.http.post<Chapter>(`${this.API_URL}/${bookId}/chapters`, chapter);
  }

  updateChapter(bookId: number, chapterId: number, chapter: UpdateChapterRequest): Observable<Chapter> {
    return this.http.put<Chapter>(`${this.API_URL}/${bookId}/chapters/${chapterId}`, chapter);
  }

  deleteChapter(bookId: number, chapterId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${bookId}/chapters/${chapterId}`);
  }

  reorderChapters(bookId: number, chapterIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${bookId}/chapters/reorder`, { chapterIds });
  }
} 