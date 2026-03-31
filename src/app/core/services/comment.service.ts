import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private baseUrl = 'http://localhost:5000/api/comments';

  constructor(private http: HttpClient) {}

  // ✅ GET
  getComments(taskId: string) {
    return this.http.get(`${this.baseUrl}/${taskId}`);
  }

  // ✅ POST
  addComment(taskId: string, body: { text: string }) {
    return this.http.post(`${this.baseUrl}/${taskId}`, body);
  }
  deleteComment(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  updateComment(id: string, body: { text: string }) {
    return this.http.put(`${this.baseUrl}/${id}`, body);
  }
}
