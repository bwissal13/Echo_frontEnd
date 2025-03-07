import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chapter } from '../models/book.interface';
import { environment } from '../../../environments/environment';
import { Comment } from '../models/comment.interface';

@Injectable({
  providedIn: 'root'
})
export class ChapterService {
  private readonly API_URL = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Get token directly from localStorage
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  createChapter(chapter: Partial<Chapter>): Observable<Chapter> {
    return this.http.post<Chapter>(`${this.API_URL}/chapters`, {
      title: chapter.title,
      content: chapter.content,
      bookId: chapter.bookId,
      orderNumber: chapter.order
    }, { headers: this.getHeaders() });
  }

  updateChapter(id: number, chapter: Partial<Chapter>): Observable<Chapter> {
    return this.http.put<Chapter>(`${this.API_URL}/chapters/${id}`, {
      title: chapter.title,
      content: chapter.content,
      bookId: chapter.bookId,
      orderNumber: chapter.order
    }, { headers: this.getHeaders() });
  }

  getChaptersByBook(bookId: number, page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<any>(`${this.API_URL}/chapters/book/${bookId}`, { 
      params,
      headers: this.getHeaders()
    });
  }

  // Soft delete (move to trash)
  moveToTrash(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/chapters/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Permanent delete
  permanentDelete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/chapters/trash/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Restore from trash
  restoreFromTrash(id: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/chapters/trash/${id}/restore`, {}, {
      headers: this.getHeaders()
    });
  }

  // Get trashed chapters
  getTrashChapters(page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<any>(`${this.API_URL}/chapters/trash`, { 
      params,
      headers: this.getHeaders()
    });
  }

  // Add this method to ChapterService
  getBookTrashChapters(bookId: number, page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<any>(`${this.API_URL}/chapters/books/${bookId}/trash`, { 
      params,
      headers: this.getHeaders()
    });
  }

  // Add these methods to ChapterService
  getChapterComments(chapterId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      `${this.API_URL}/comments/chapter/${chapterId}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error fetching comments:', error);
        return throwError(() => new Error('Failed to fetch comments'));
      })
    );
  }

  addComment(chapterId: number, content: string, parentCommentId?: number): Observable<Comment> {
    const payload = {
      content,
      chapterId,
      parentCommentId: parentCommentId || null
    };

    return this.http.post<Comment>(
      `${this.API_URL}/comments`,
      payload,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error adding comment:', error);
        return throwError(() => new Error('Failed to add comment'));
      })
    );
  }

  addCommentReply(chapterId: number, parentCommentId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(
      `${this.API_URL}/comments`,
      {
        content,
        chapterId,
        parentCommentId
      },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error adding reply:', error);
        return throwError(() => new Error('Failed to add reply'));
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
        return throwError(() => new Error('Failed to fetch replies'));
      })
    );
  }

  toggleCommentLike(commentId: number): Observable<{ likesCount: number }> {
    return this.http.post<{ likesCount: number }>(
      `${this.API_URL}/comments/${commentId}/like`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error toggling like:', error);
        return throwError(() => new Error('Failed to toggle like'));
      })
    );
  }
} 