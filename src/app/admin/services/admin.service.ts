import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, forkJoin, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../../auth/models/auth.interface';
import { AuthService } from '../../auth/services/auth.service';
import { DashboardStats } from '../models/admin.interface';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = `${environment.apiUrl}/api/v1`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getDashboardStats(): Observable<DashboardStats> {
    // Use existing endpoints to gather stats
    return forkJoin({
      users: this.getUsers(0, 1),
      books: this.http.get<PageResponse<any>>(`${this.API_URL}/books`, {
        headers: this.getHeaders(),
        params: new HttpParams().set('page', '0').set('size', '1')
      }),
      roleRequests: this.getRoleRequests()
    }).pipe(
      map(response => ({
        totalUsers: response.users.totalElements || 0,
        newUsersThisWeek: 0, // We'll need to calculate this if backend provides the data
        totalBooks: response.books.totalElements || 0,
        newBooksThisWeek: 0, // We'll need to calculate this if backend provides the data
        pendingRoleRequests: Array.isArray(response.roleRequests) ? response.roleRequests.length : 0
      })),
      catchError(error => {
        console.error('Error fetching dashboard stats:', error);
        return of({
          totalUsers: 0,
          newUsersThisWeek: 0,
          totalBooks: 0,
          newBooksThisWeek: 0,
          pendingRoleRequests: 0
        });
      })
    );
  }

  getUsers(page: number = 0, size: number = 10, search?: string): Observable<PageResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PageResponse<User>>(`${this.API_URL}/users`, {
      headers: this.getHeaders(),
      params
    });
  }

  updateUserRole(userId: number, role: string): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/users/${userId}/role`, { role }, {
      headers: this.getHeaders()
    });
  }

  updateUserStatus(userId: number, enabled: boolean): Observable<User> {
    return this.http.put<User>(
      `${this.API_URL}/users/${userId}/status?enabled=${enabled}`, 
      {}, // Empty body since we're using query parameter
      { headers: this.getHeaders() }
    );
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/${userId}`, {
      headers: this.getHeaders()
    });
  }

  getRoleRequests(): Observable<any> {
    return this.http.get(`${this.API_URL}/roles/requests`, {
      headers: this.getHeaders()
    });
  }

  approveRoleRequest(requestId: number, adminComment: string): Observable<any> {
    return this.http.post(`${this.API_URL}/roles/approve/${requestId}`, { adminComment }, {
      headers: this.getHeaders()
    });
  }

  rejectRoleRequest(requestId: number, adminComment: string): Observable<any> {
    return this.http.post(`${this.API_URL}/roles/reject/${requestId}`, { adminComment }, {
      headers: this.getHeaders()
    });
  }

  safeDeleteUser(userId: number): Observable<void> {
    // Now that the backend handles cascade deletion, we can directly delete the user
    return this.deleteUser(userId);
  }
} 