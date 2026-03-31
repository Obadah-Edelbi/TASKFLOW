import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private api = 'http://localhost:5000/api/tasks';
  private usersApi = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient) {}

  /* ================= USER TASKS ================= */

  // get my tasks
  getAll(): Observable<any> {
    return this.http.get(this.api);
  }

  // get single task
  getById(id: string): Observable<any> {
    return this.http.get(`${this.api}/${id}`);
  }

  // create task
  create(data: any): Observable<any> {
    return this.http.post(this.api, data);
  }

  // update task (user cannot change status)
  update(id: string, data: any): Observable<any> {
    return this.http.put(`${this.api}/${id}`, data);
  }

  // delete my task
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  // add comment to task
  addComment(id: string, text: string): Observable<any> {
    return this.http.post(`${this.api}/${id}/comments`, { text });
  }

  // get comments
  getComments(id: string): Observable<any> {
    return this.http.get(`${this.api}/${id}/comments`);
  }

  /* ================= ADMIN ================= */

  // get all tasks (admin)
  getAllAdmin(): Observable<any> {
    return this.http.get(`${this.api}/admin/all`);
  }

  // 🔥 FIXED HERE
  // update task status (admin)
  updateStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.api}/update-status/${id}`, { status });
  }

  // delete task as admin
  deleteAsAdmin(id: string): Observable<any> {
    return this.http.delete(`${this.api}/admin/${id}`);
  }

  // assign task
  assignTask(id: string, userId: string): Observable<any> {
    return this.http.put(`${this.api}/admin/assign/${id}`, { userId });
  }

  // get admin statistics
  getAdminStats(): Observable<any> {
    return this.http.get(`${this.api}/admin/stats`);
  }

  /* ================= USERS ================= */

  // get all users (for assigning tasks)
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.usersApi}/all-users`);
  }
}
