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
  private readonly API_URL = 'http://localhost:8080/api/v1/users/authors';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
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

  toggleFollow(authorId: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.API_URL}/${authorId}/follow`, {}, {
      headers: this.getHeaders()
    });
  }
} 