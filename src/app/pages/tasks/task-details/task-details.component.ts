import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TasksService } from '../../../core/services/tasks.service';
import { Task } from '../../../core/models/task.model';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../../core/services/comment.service';
import { MatIconModule } from '@angular/material/icon';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.scss',
})
export class TaskDetailsComponent implements OnInit {
  task?: Task;
  loading = true;
  currentUser: any;
  taskId!: string;

  newComment: string = '';
  comments: any[] = [];
  editingCommentId: string | null = null;
  editText: string = '';

  constructor(
    private route: ActivatedRoute,
    private tasksService: TasksService,
    public authService: AuthService,
    private router: Router,
    private commentService: CommentService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) return;

    this.taskId = id;

    // تحميل التاسك
    this.tasksService.getById(id).subscribe({
      next: (task) => {
        this.task = task;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
    this.currentUser = this.authService.user;
    // تحميل الكومنتات
    this.loadComments();
  }

  // ================= COMMENTS =================
  getUser(): { id: string; name: string } | null {
    const user = localStorage.getItem('user');
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }
  loadComments() {
    this.commentService.getComments(this.taskId).subscribe({
      next: (res: any) => {
        this.comments = res;
      },
      error: (err) => {
        console.error('Error loading comments', err);
      },
    });
  }

  editComment(comment: any) {
    this.editingCommentId = comment._id;
    this.editText = comment.text;
  }
  isOwner(comment: any): boolean {
    const userId = this.authService.user?.id;
    const authorId = comment.author?._id || comment.author;

    return String(authorId) === String(userId);
  }

  trackById(index: number, item: any) {
    return item._id;
  }

  addComment() {
    if (!this.newComment?.trim()) return;

    this.commentService
      .addComment(this.taskId, { text: this.newComment })
      .subscribe({
        next: (res: any) => {
          const newComment = {
            ...res,
            author:
              typeof res.author === 'object'
                ? res.author
                : {
                    _id: this.authService.user?.id,
                    name: this.authService.user?.name,
                  },
          };

          this.comments = [...this.comments, newComment];
          this.newComment = '';
        },
      });
  }

  deleteComment(id: string) {
    this.commentService.deleteComment(id).subscribe(() => {
      this.comments = this.comments.filter((c) => c._id !== id);
    });
  }

  updateComment(id: string) {
    if (!this.editText.trim()) return;

    this.commentService
      .updateComment(id, {
        text: this.editText,
      })
      .subscribe({
        next: (updated: any) => {
          const index = this.comments.findIndex((c) => c._id === id);

          if (index !== -1) {
            this.comments[index] = updated;
          }

          this.editingCommentId = null;
          this.editText = '';
        },
      });
  }

  // ================= TASK ACTIONS =================

  goBack() {
    this.router.navigate(['/dashboard/tasks']);
  }

  editTask() {
    if (!this.task) return;
    this.router.navigate(['/dashboard/tasks', this.task._id, 'edit']);
  }

  async deleteTask() {
    if (!this.task) return;

    const result = await Swal.fire({
      title: 'Delete Task?',
      text: this.task.title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
    });

    if (!result.isConfirmed) return;

    this.tasksService.delete(this.task._id).subscribe({
      next: () => {
        this.router.navigate(['/dashboard/tasks']);
      },
      error: () => {
        console.error('Delete failed');
      },
    });
  }
}
