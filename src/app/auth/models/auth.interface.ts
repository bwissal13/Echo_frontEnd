export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum Role {
  USER = 'USER',
  AUTHOR = 'AUTHOR',
  ADMIN = 'ADMIN'
}

export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  bio: string;
  profilePicture: string;
  role: string;
  enabled: boolean;
  emailVerified: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterData {
  firstname: string;    // Required, 2-50 characters
  lastname: string;     // Required, 2-50 characters
  email: string;       // Required, valid email format
  password: string;    // Required, minimum 6 characters
  bio?: string;        // Optional
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    bio: string;
    profilePicture: string;
    role: string;
    enabled: boolean;
    emailVerified: boolean;
  };
  message?: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

export interface OtpResponse {
  message: string;
  expiresIn: number;
}

export interface RoleChangeRequest {
  requestedRole: string;
  reason: string;
}

export interface RoleChangeResponse {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
} 