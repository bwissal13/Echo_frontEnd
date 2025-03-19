import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Page } from '../../shared/models/page.model';
import { Author, AuthorsResponse } from '../models/author.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthorsService {
  private readonly API_URL = `${environment.apiUrl}/api/v1/users/authors`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Authentication token is missing');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    });
  }

  getAuthors(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'firstname',
    direction: 'asc' | 'desc' = 'asc',
    search?: string
  ): Observable<AuthorsResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction)
      .set('search', search || '');

    return this.http.get<AuthorsResponse>(this.API_URL, { 
      headers: this.getHeaders(),
      params 
    }).pipe(
      catchError(error => {
        console.error('Error fetching authors:', error);
        return throwError(() => new Error(error.message || 'Failed to fetch authors'));
      })
    );
  }

  getAuthorDetails(authorId: string): Observable<Author> {
    return this.http.get<Author>(`${this.API_URL}/${authorId}`, {
      headers: this.getHeaders()
    });
  }

  subscribeToAuthor(authorId: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/v1/subscriptions/users/${authorId}`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error subscribing to author:', error);
        return throwError(() => new Error('Failed to subscribe to author'));
      })
    );
  }

  unsubscribeFromAuthor(authorId: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/api/v1/subscriptions/users/${authorId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error unsubscribing from author:', error);
        return throwError(() => new Error('Failed to unsubscribe from author'));
      })
    );
  }

  toggleFollow(authorId: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/v1/subscriptions/users/${authorId}`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error toggling subscription status:', error);
        return throwError(() => new Error('Failed to update subscription status'));
      })
    );
  }
} 