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
  private readonly API_URL = `${environment.apiUrl}/api/v1/books`;

  constructor(private http: HttpClient) {}

  getBooks(page: number = 0, size: number = 10, search?: string): Observable<BookPage> {
    let url = `${this.API_URL}?page=${page}&size=${size}`;
    if (search) {
      url += `&search=${search}`;
    }
    return this.http.get<BookPage>(url);
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.API_URL}/${id}`);
  }

  getMyBooks(page: number = 0, size: number = 10): Observable<BookPage> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'createdAt,desc');

    return this.http.get<BookPage>(`${this.API_URL}/me`, { headers, params }).pipe(
      tap(response => console.log('My books response:', response)),
      catchError(error => {
        console.error('Error fetching my books:', error);
        if (error.status === 401) {
          return throwError(() => new Error('Please log in to view your books'));
        } else if (error.status === 403) {
          return throwError(() => new Error('You don\'t have permission to view these books'));
        }
        return throwError(() => new Error('Failed to fetch your books. Please try again.'));
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

  createBook(book: any): Observable<any> {
    const token = localStorage.getItem('token');
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const bookData = {
      title: book.title?.trim(),
      description: book.description?.trim() || '',
      genre: book.genre,
      isPublic: book.isPublic || false,
      coverImage: book.coverImage || null,
      chapters: book.chapters || []
    };

    return this.http.post<any>(this.API_URL, bookData, { headers }).pipe(
      catchError(error => {
        console.error('Error in createBook:', error);
        
        if (error.status === 400) {
          const validationErrors = error.error?.errors || error.error?.message;
          if (typeof validationErrors === 'object') {
            const messages = Object.values(validationErrors).join(', ');
            return throwError(() => new Error(`Validation failed: ${messages}`));
          }
          return throwError(() => new Error(validationErrors || 'Validation failed'));
        }
        
        if (error.status === 403) {
          return throwError(() => new Error('You do not have permission to create books'));
        }
        
        return throwError(() => new Error('Failed to create book. Please try again.'));
      })
    );
  }

  updateBook(id: number, book: UpdateBookRequest): Observable<Book> {
    return this.http.put<Book>(`${this.API_URL}/${id}`, book);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  uploadCoverImage(file: File): Observable<{url: string}> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<{url: string}>(`${environment.apiUrl}/api/v1/files/upload`, formData).pipe(
      tap(response => {
        console.log('Upload response:', response);
        if (!response?.url) {
          throw new Error('Invalid response format: missing URL');
        }
      }),
      catchError(error => {
        console.error('Upload error:', error);
        if (error.status === 404) {
          return throwError(() => new Error('Upload endpoint not found'));
        }
        return throwError(() => new Error('Failed to upload image'));
      })
    );
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