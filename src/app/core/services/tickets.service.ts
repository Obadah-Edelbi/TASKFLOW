import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments.development';
import { Observable } from 'rxjs';
export interface Ticket {
  _id: string;
  title: string;
  description?: string;
  status?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private api = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.api);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
