import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
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
  OtpResponse 
} from '../models/auth.interface';
import { ApiError } from '../models/api-error.interface';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/v1/auth`;
  private readonly TOKEN_KEY = 'token';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly TOKEN_EXPIRY_KEY = 'tokenExpiry';
  private readonly USER_KEY = 'user';
  private readonly REMEMBER_ME_KEY = 'rememberMe';
  
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

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);

    if (token && user && expiry) {
      const expiryDate = new Date(expiry);
      if (expiryDate > new Date()) {
        this.authState.next({
          isAuthenticated: true,
          user: JSON.parse(user),
          loading: false,
          error: null
        });
        this.setupAutoRefresh(expiryDate);
      } else {
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
    
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData, {
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
    return this.http.post<AuthResponse>(`${this.API_URL}/verify-otp`, data).pipe(
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
    this.setLoading(true);
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((response: AuthResponse) => {
        this.handleAuthSuccess(response, credentials.rememberMe);
      }),
      catchError(this.handleError.bind(this)),
      tap(() => this.setLoading(false))
    );
  }

  private handleAuthSuccess(response: AuthResponse, rememberMe: boolean): void {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24); // 24 hour expiry

    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryDate.toISOString());
    localStorage.setItem(this.REMEMBER_ME_KEY, String(rememberMe));

    this.authState.next({
      isAuthenticated: true,
      user: response.user,
      loading: false,
      error: null
    });

    this.setupAutoRefresh(expiryDate);
    this.showSuccessMessage('Login successful!');
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.REMEMBER_ME_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);

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
    return this.http.post<OtpResponse>(`${this.API_URL}/forgot-password`, { email }).pipe(
      tap(() => {
        this.showSuccessMessage('Password reset instructions sent to your email.');
      }),
      catchError(this.handleError.bind(this)),
      tap(() => this.setLoading(false))
    );
  }

  resetPassword(data: ResetPasswordData): Observable<{ message: string }> {
    this.setLoading(true);
    return this.http.post<{ message: string }>(`${this.API_URL}/reset-password`, {
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
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/refresh-token`, { refreshToken }).pipe(
      tap((response) => {
        this.handleAuthSuccess(response, localStorage.getItem(this.REMEMBER_ME_KEY) === 'true');
      }),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  resendOtp(email: string): Observable<OtpResponse> {
    this.setLoading(true);
    return this.http.post<OtpResponse>(`${this.API_URL}/resend-otp`, { email }).pipe(
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
} 