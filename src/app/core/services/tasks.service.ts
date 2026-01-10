import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments.development';
import { map } from 'rxjs/operators';

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'new' | 'in_progress' | 'resolved' | 'rejected';
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  private api = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any>(this.api).pipe(map((res) => res.tasks ?? []));
  }

  getById(id: string) {
    return this.http.get<Task>(`${this.api}/${id}`);
  }

  create(payload: any) {
    return this.http.post(`${this.api}`, payload);
  }

  update(id: string, payload: any) {
    return this.http.put(`${this.api}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
