import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private api = 'http://localhost:5000/api/tasks';
  private usersApi = 'http://localhost:5000/api/users';

  private tasksSubject = new BehaviorSubject<any[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  constructor(private http: HttpClient) {}

  /* ================= USER TASKS ================= */

  getAll(): Observable<any> {
    return this.http.get<any[]>(this.api).pipe(
      tap((tasks: any) => {
        this.tasksSubject.next(tasks.tasks || tasks);
      }),
    );
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`);
  }
  create(data: any): Observable<any> {
    return this.http.post(this.api, data).pipe(
      tap((newTask: any) => {
        this.tasksSubject.next([newTask, ...this.tasksSubject.value]);
      }),
    );
  }

  update(id: string, data: any): Observable<any> {
    return this.http.put(`${this.api}/${id}`, data).pipe(
      tap((updatedTask: any) => {
        const updated = this.tasksSubject.value.map((task) =>
          task._id === id ? updatedTask : task,
        );
        this.tasksSubject.next(updated);
      }),
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}`).pipe(
      tap(() => {
        const filtered = this.tasksSubject.value.filter(
          (task) => task._id !== id,
        );
        this.tasksSubject.next(filtered);
      }),
    );
  }

  addComment(id: string, text: string): Observable<any> {
    return this.http.post(`${this.api}/${id}/comments`, { text });
  }

  getComments(id: string): Observable<any> {
    return this.http.get(`${this.api}/${id}/comments`);
  }

  /* ================= ADMIN ================= */

  getAllAdmin(): Observable<any> {
    return this.http.get(`${this.api}/admin/all`).pipe(
      tap((tasks: any) => {
        this.tasksSubject.next(tasks.tasks || tasks);
      }),
    );
  }

  updateStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.api}/update-status/${id}`, { status }).pipe(
      tap((updatedTask: any) => {
        const updated = this.tasksSubject.value.map((task) =>
          task._id === id ? updatedTask : task,
        );
        this.tasksSubject.next(updated);
      }),
    );
  }

  deleteAsAdmin(id: string): Observable<any> {
    return this.http.delete(`${this.api}/admin/${id}`).pipe(
      tap(() => {
        const filtered = this.tasksSubject.value.filter(
          (task) => task._id !== id,
        );
        this.tasksSubject.next(filtered);
      }),
    );
  }

  assignTask(id: string, userId: string): Observable<any> {
    return this.http.put(`${this.api}/admin/assign/${id}`, { userId }).pipe(
      tap((updatedTask: any) => {
        const updated = this.tasksSubject.value.map((task) =>
          task._id === id ? updatedTask : task,
        );
        this.tasksSubject.next(updated);
      }),
    );
  }

  getAdminStats(): Observable<any> {
    return this.http.get(`${this.api}/admin/stats`);
  }

  /* ================= USERS ================= */

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.usersApi}/all-users`);
  }

  setTasks(tasks: any[]) {
    this.tasksSubject.next(tasks);
  }
}
