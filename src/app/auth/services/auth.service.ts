import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer, of } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User, 
  AuthState,
  VerifyEmailData,
  ForgotPasswordData,
  ResetPasswordData,
  OtpResponse,
  RoleChangeRequest,
  RoleChangeResponse,
  Role
} from '../models/auth.interface';
import { ApiError } from '../models/api-error.interface';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/v1`;
  private readonly AUTH_URL = `${this.API_URL}/auth`;
  private readonly USERS_URL = `${this.API_URL}/users`;
  private readonly TOKEN_KEY = 'token';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly TOKEN_EXPIRY_KEY = 'tokenExpiry';
  private readonly USER_KEY = 'user';
  private readonly REMEMBER_ME_KEY = 'rememberMe';
  private readonly USER_ROLES_KEY = 'user_roles';
  
  private authState = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  });

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.authState.next({
          isAuthenticated: true,
          user,
          loading: false,
          error: null
        });
      } catch {
        this.logout();
      }
    }
  }

  private setupAutoRefresh(expiryDate: Date): void {
    const now = new Date();
    const timeUntilExpiry = expiryDate.getTime() - now.getTime();
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000); // Refresh 5 minutes before expiry

    if (refreshTime > 0) {
      timer(refreshTime).pipe(
        switchMap(() => this.refreshToken())
      ).subscribe();
    }
  }

  getAuthState(): Observable<AuthState> {
    return this.authState.asObservable();
  }

  register(userData: RegisterData): Observable<OtpResponse> {
    this.setLoading(true);
    console.log('Sending registration request:', userData);
    
    return this.http.post<AuthResponse>(`${this.AUTH_URL}/register`, userData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }),
      observe: 'response'
    }).pipe(
      map(response => {
        console.log('Full registration response:', response);
        // Store the access token
        if (response.body?.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, response.body.accessToken);
        }
        // Return OTP response format
        return {
          message: response.body?.message || 'Registration successful! Please check your email for verification code.',
          expiresIn: 300 // 5 minutes expiry for OTP
        };
      }),
      tap((response) => {
        console.log('Registration response transformed:', response);
        this.showSuccessMessage(response.message);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Registration error:', error);
        let errorMessage = 'Registration failed';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.status === 400) {
            errorMessage = 'Invalid registration data. Please check your input.';
            console.error('Invalid registration data:', error.error);
          } else if (error.status === 409) {
            errorMessage = 'Email already exists.';
          } else {
            errorMessage = `Error: ${error.status} - ${error.statusText}`;
          }
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
        
        return throwError(() => errorMessage);
      }),
      tap(() => this.setLoading(false))
    );
  }

  verifyEmail(data: VerifyEmailData): Observable<AuthResponse> {
    this.setLoading(true);
    return this.http.post<AuthResponse>(`${this.AUTH_URL}/verify-otp`, data).pipe(
      tap((response) => {
        this.showSuccessMessage('Email verified successfully!');
        // Store auth data
        if (response.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, response.accessToken);
          if (response.user) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
          }
        }
      }),
      catchError(this.handleError.bind(this)),
      tap(() => this.setLoading(false))
    );
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.authState.next({ ...this.authState.value, loading: true });
    
    return this.http.post<AuthResponse>(`${this.AUTH_URL}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.accessToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        
        this.authState.next({
          isAuthenticated: true,
          user: response.user,
          loading: false,
          error: null
        });
      }),
      catchError(this.handleError.bind(this))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    
    this.authState.next({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    });
    
    this.router.navigate(['/auth/login']);
  }

  forgotPassword(email: string): Observable<OtpResponse> {
    this.setLoading(true);
    return this.http.post<OtpResponse>(`${this.AUTH_URL}/forgot-password`, { email }).pipe(
      tap(() => {
        this.showSuccessMessage('Password reset instructions sent to your email.');
      }),
      catchError(this.handleError.bind(this)),
      tap(() => this.setLoading(false))
    );
  }

  resetPassword(data: ResetPasswordData): Observable<{ message: string }> {
    this.setLoading(true);
    return this.http.post<{ message: string }>(`${this.AUTH_URL}/reset-password`, {
      email: data.email,
      code: data.code,
      newPassword: data.newPassword
    }).pipe(
      tap(() => {
        this.showSuccessMessage('Password reset successful!');
      }),
      catchError(this.handleError.bind(this)),
      tap(() => this.setLoading(false))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token found'));
    }

    return this.http.post<AuthResponse>(`${this.AUTH_URL}/refresh`, { refreshToken }).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.accessToken);
        if (response.user) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        }
        
        this.authState.next({
          isAuthenticated: true,
          user: response.user,
          loading: false,
          error: null
        });
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  resendOtp(email: string): Observable<OtpResponse> {
    this.setLoading(true);
    return this.http.post<OtpResponse>(`${this.AUTH_URL}/resend-otp`, { email }).pipe(
      tap(() => {
        this.showSuccessMessage('Verification code resent successfully.');
      }),
      catchError(this.handleError.bind(this)),
      tap(() => this.setLoading(false))
    );
  }

  private setLoading(loading: boolean): void {
    this.authState.next({ ...this.authState.value, loading });
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      const apiError = error.error as ApiError;
      errorMessage = apiError.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    this.authState.next({
      ...this.authState.value,
      error: errorMessage
    });

    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });

    return throwError(() => errorMessage);
  }

  getCurrentUser(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.USERS_URL}/me`, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  becomeAuthor(): Observable<any> {
    return this.http.post(`${this.AUTH_URL}/become-author`, {});
  }

  hasRole(roleToCheck: string): boolean {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return false;
    
    try {
      const user = JSON.parse(userStr);
      return user?.role === roleToCheck;
    } catch {
      return false;
    }
  }

  requestAuthorRole(reason: string): Observable<RoleChangeResponse> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    const request: RoleChangeRequest = {
      requestedRole: Role.AUTHOR,
      reason: reason
    };

    return this.http.post<RoleChangeResponse>(
      `${this.API_URL}/roles/request`,
      request,
      { headers }
    ).pipe(
      tap(response => {
        console.log('Role request response:', response);
        if (response.status === 'APPROVED') {
          this.refreshUserInfo();
        }
      }),
      catchError(error => {
        console.error('Role request error:', error);
        if (error.status === 500) {
          return throwError(() => new Error('Server error. Please try again later.'));
        } else if (error.status === 404) {
          return throwError(() => new Error('Role request endpoint not found. Please contact support.'));
        }
        return throwError(() => error.error?.message || 'Failed to submit request');
      })
    );
  }

  private refreshUserInfo(): void {
    this.getCurrentUser().subscribe({
      next: (user) => {
        this.updateAuthState({ user, isAuthenticated: true });
      }
    });
  }

  private updateAuthState(newState: Partial<AuthState>): void {
    this.authState.next({
      ...this.authState.value,
      ...newState,
      loading: this.authState.value.loading,
      error: this.authState.value.error
    });
  }

  verifyToken(): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.AUTH_URL}/verify`, { headers }).pipe(
      catchError(error => {
        if (error.status === 401 || error.status === 403) {
          return throwError(() => new Error('Invalid or expired token'));
        }
        return throwError(() => error);
      })
    );
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);
    return !!token && !!user;
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token; // Returns true if token exists, false otherwise
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<User>(`${this.USERS_URL}/me`, userData, { headers }).pipe(
      tap(user => {
        const currentState = this.authState.value;
        this.authState.next({
          ...currentState,
          user: { ...currentState.user, ...user }
        });
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }),
      catchError(this.handleError.bind(this))
    );
  }

  private getCurrentUserSync(): any {
    return this.authState.value.user;
  }

  requestRoleChange(request: RoleChangeRequest): Observable<RoleChangeResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<RoleChangeResponse>(
      `${this.API_URL}/roles/request`,
      request,
      { headers }
    ).pipe(
      tap(response => {
        console.log('Role request response:', response);
        if (response.status === 'APPROVED') {
          this.refreshUserInfo();
        }
      }),
      catchError(error => {
        console.error('Role request error:', error);
        if (error.status === 500) {
          return throwError(() => new Error('Server error. Please try again later.'));
        } else if (error.status === 404) {
          return throwError(() => new Error('Role request endpoint not found. Please contact support.'));
        }
        return throwError(() => error.error?.message || 'Failed to submit request');
      })
    );
  }

  getMyRoleRequests(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.API_URL}/roles/my-requests`, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching role requests:', error);
        return throwError(() => error.error?.message || 'Failed to fetch role requests');
      })
    );
  }
}