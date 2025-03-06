import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { tap, catchError, retry, delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Book, 
  CreateBookRequest, 
  UpdateBookRequest, 
  BookPage, 
  Chapter, 
  CreateChapterRequest, 
  UpdateChapterRequest,
  PageResponse 
} from '../models/book.interface';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userFullName: string;
  userAvatar: string;
  likesCount: number;
  isLiked: boolean;
  replies?: Comment[];
}

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

  getApiUrl(): string {
    return this.API_URL.replace('/books', '');
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
    return this.http.get<Book>(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
      .pipe(
        retry({
          count: 3,
          delay: 1000
        }),
        catchError(error => {
          console.error('Error fetching book:', error);
          return throwError(() => error);
        })
      );
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

  getPublicBooks(page: number, size: number, filter: string, search: string): Observable<PageResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('filter', filter)
      .set('search', search || '');

    return this.http.get<PageResponse<any>>(`${this.API_URL}`, { 
      params,
      headers: this.getHeaders() 
    }).pipe(
      retry({
        count: 3,
        delay: 1000
      }),
      catchError(error => {
        console.error('Error fetching public books:', error);
        return throwError(() => error);
      })
    );
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

  getChapters(bookId: number, page = 0, size = 10): Observable<PageResponse<Chapter>> {
    return this.http.get<PageResponse<Chapter>>(
      `${this.API_URL}/chapters/book/${bookId}?page=${page}&size=${size}`,
      { headers: this.getHeaders() }
    ).pipe(
      retry({
        count: 3,
        delay: 1000
      }),
      catchError(error => {
        console.error('Error fetching chapters:', error);
        return throwError(() => error);
      })
    );
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

  moveToTrash(bookId: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${bookId}/trash`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error moving book to trash:', error);
        return throwError(() => new Error('Failed to move book to trash'));
      })
    );
  }

  getTrashBooks(page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<any>(`${this.API_URL}/trash`, { 
      params,
      headers: this.getHeaders()
    });
  }

  restoreFromTrash(bookId: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/trash/${bookId}/restore`, {}, {
      headers: this.getHeaders()
    });
  }

  permanentDelete(bookId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/trash/${bookId}`, {
      headers: this.getHeaders()
    });
  }

  getChapterInfo(chapterId: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/chapters/${chapterId}/info`, {
      headers: this.getHeaders()
    });
  }

  getChapterComments(chapterId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.API_URL}/comments/chapter/${chapterId}`, {
      headers: this.getHeaders()
    });
  }

  addComment(chapterId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.API_URL}/comments`, {
      content,
      bookId: null,
      chapterId,
      parentCommentId: null
    }, {
      headers: this.getHeaders()
    });
  }

  addBookComment(bookId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.API_URL}/${bookId}/comments`,
      { 
        content,
        bookId,
        parentCommentId: null
      },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error adding comment:', error);
        return throwError(() => error);
      })
    );
  }

  addCommentReply(bookId: number, parentCommentId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.API_URL}/${bookId}/comments`,
      {
        content,
        bookId,
        parentCommentId
      },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error adding reply:', error);
        return throwError(() => error);
      })
    );
  }

  getCommentReplies(commentId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      `${this.API_URL}/comments/${commentId}/replies`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error fetching replies:', error);
        return throwError(() => error);
      })
    );
  }

  toggleChapterReaction(chapterId: number, type: string): Observable<any> {
    return this.http.post<any>(
      `${this.API_URL}/chapters/${chapterId}/reactions`,
      { type },
      { headers: this.getHeaders() }
    );
  }

  getBookCoverUrl(coverImage: string | null): string {
    if (!coverImage) {
      return 'assets/images/default-book-cover.jpg';
    }
    if (coverImage.startsWith('http')) {
      return coverImage;
    }
    return `${this.FILE_API_URL}/${coverImage}`;
  }

  getBookComments(bookId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      `${this.API_URL}/${bookId}/comments`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error fetching comments:', error);
        return throwError(() => error);
      })
    );
  }

  toggleBookSubscription(bookId: number): Observable<{ isSubscribed: boolean }> {
    return this.http.post<{ isSubscribed: boolean }>(
      `${this.API_URL}/${bookId}/subscribe`,
      {},
      { headers: this.getHeaders() }
    );
  }

  toggleCommentLike(commentId: number): Observable<{ likesCount: number }> {
    return this.http.post<{ likesCount: number }>(
      `${this.API_URL}/comments/${commentId}/like`,
      {},
      { headers: this.getHeaders() }
    );
  }

  setBookVisibility(bookId: number, makePublic: boolean): Observable<Book> {
    const visibility = makePublic ? 'public' : 'private';
    return this.http.put<Book>(
      `${this.API_URL}/${bookId}/visibility/${visibility}`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        console.log('Visibility update response:', response);
      }),
      map(response => {
        return {
          ...response,
          isPublic: makePublic
        };
      }),
      catchError(error => {
        console.error('Error updating book visibility:', error);
        if (error.status === 403) {
          return throwError(() => new Error('You do not have permission to change this book\'s visibility'));
        }
        return throwError(() => new Error('Failed to update book visibility'));
      })
    );
  }
} 