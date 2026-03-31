import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments.development';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  // 🔥 ADD THIS
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  // =============================
  // STATE MANAGEMENT 🔥
  // =============================
  setUser(user: any) {
    this.userSubject.next(user);
  }

  getCurrentUser() {
    return this.userSubject.value;
  }

  // =============================
  // UPDATE PROFILE
  // =============================
  updateProfile(data: any) {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }

  // =============================
  // UPLOAD IMAGE
  // =============================
  uploadImage(formData: FormData) {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  // =============================
  // GET CURRENT USER
  // =============================
  getMe() {
    return this.http.get(`${this.apiUrl}/me`);
  }
}
