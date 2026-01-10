import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environments.development';

@Injectable({
  // يخلي السيرفس متاح بكل التطبيق (Singleton)
  providedIn: 'root',
})
export class AuthService {
  // رابط السيرفر الأساسي الخاص بالمستخدمين

  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // =========================
  // Login — تسجيل الدخول
  // =========================
  login(data: { email: string; password: string }) {
    // نبعث email + password للسيرفر
    return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => {
        // نحفظ التوكن بالـ localStorage
        localStorage.setItem('token', res.token);

        // نحفظ بيانات المستخدم (بعد تحويلها لـ JSON)
        localStorage.setItem('user', JSON.stringify(res.user));
      })
    );
  }

  // =========================
  // Register — إنشاء حساب جديد
  // =========================
  register(data: { name?: string; email?: string; password?: string }) {
    // نبعث بيانات التسجيل للسيرفر
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }

  // =========================
  // Logout — تسجيل الخروج
  // =========================
  logout() {
    // نحذف كل البيانات المحفوظة
    localStorage.clear();
  }

  // =========================
  // Get Token
  // =========================
  getToken() {
    // نرجّع التوكن من التخزين
    return localStorage.getItem('token');
  }

  // =========================
  // Get Logged User
  // =========================
  getUser() {
    // نجيب المستخدم من التخزين
    const user = localStorage.getItem('user');

    // إذا موجود نعمله parse، غير هيك null
    return user ? JSON.parse(user) : null;
  }

  // =========================
  // Is Logged In?
  // =========================
  isLoggedIn(): boolean {
    // إذا في توكن → المستخدم مسجل دخول
    return !!this.getToken();
  }

  // =========================
  // Is Admin?
  // =========================
  isAdmin(): boolean {
    // نجيب المستخدم
    const user = this.getUser();

    // نتحقق من الدور
    return user?.role === 'admin';
  }
}
