import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chapter } from '../models/book.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChapterService {
  private apiUrl = `${environment.apiUrl}/api/v1/chapters`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Get token directly from localStorage
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  createChapter(chapter: Partial<Chapter>): Observable<Chapter> {
    return this.http.post<Chapter>(this.apiUrl, {
      title: chapter.title,
      content: chapter.content,
      bookId: chapter.bookId,
      orderNumber: chapter.order
    }, { headers: this.getHeaders() });
  }

  updateChapter(id: number, chapter: Partial<Chapter>): Observable<Chapter> {
    return this.http.put<Chapter>(`${this.apiUrl}/${id}`, {
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
    
    return this.http.get<any>(`${this.apiUrl}/book/${bookId}`, { 
      params,
      headers: this.getHeaders()
    });
  }

  // Soft delete (move to trash)
  moveToTrash(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Permanent delete
  permanentDelete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/trash/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Restore from trash
  restoreFromTrash(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/trash/${id}/restore`, {}, {
      headers: this.getHeaders()
    });
  }

  // Get trashed chapters
  getTrashChapters(page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<any>(`${this.apiUrl}/trash`, { 
      params,
      headers: this.getHeaders()
    });
  }

  // Add this method to ChapterService
  getBookTrashChapters(bookId: number, page = 0, size = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<any>(`${this.apiUrl}/books/${bookId}/trash`, { 
      params,
      headers: this.getHeaders()
    });
  }
} 