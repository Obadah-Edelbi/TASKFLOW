import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environments.development';
import { User } from '../models/user.model';

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // =========================
  // Login
  // =========================
  login(data: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => {
        localStorage.setItem('userId', res.user.id);
        localStorage.setItem('token', res.token);

        // 🔥🔥🔥 هذا السطر الناقص
        localStorage.setItem('user', JSON.stringify(res.user));
      }),
    );
  }

  // =========================
  // Register
  // =========================
  register(data: { name: string; email: string; password: string }) {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // =========================
  // Logout
  // =========================
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // =========================
  // Save Session (Private)
  // =========================
  private saveSession(res: AuthResponse) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
  }

  // =========================
  // Getters
  // =========================
  get token(): string | null {
    return localStorage.getItem('token');
  }

  get user(): User | null {
    const user = localStorage.getItem('user');
    return user ? (JSON.parse(user) as User) : null;
  }
  get isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }

  get isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  forgotPassword(data: { email: string }) {
    return this.http.post(`${this.apiUrl}/forgot-password`, data);
  }
}
