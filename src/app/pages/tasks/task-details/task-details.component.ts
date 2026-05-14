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

  newComment = '';
  comments: any[] = [];
  editingCommentId: string | null = null;
  editText = '';

  constructor(
    private route: ActivatedRoute,
    private tasksService: TasksService,
    public authService: AuthService,
    private router: Router,
    private commentService: CommentService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.taskId = id;
    this.currentUser = this.authService.user;

    this.tasksService.getById(id).subscribe({
      next: (task) => {
        this.task = task;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });

    this.loadComments();
  }

  /* ================= COMMENTS ================= */

  loadComments() {
    this.commentService.getComments(this.taskId).subscribe({
      next: (res: any) => {
        this.comments = res.map((c: any) => ({
          ...c,
          author: c.author || c.addedBy || c.user,
        }));
      },
      error: (err) => console.error('Load comments error:', err),
    });
  }
  addComment() {
    if (!this.newComment.trim()) return;

    const currentUser = this.authService.user;
    if (!currentUser) return;

    this.commentService
      .addComment(this.taskId, { text: this.newComment })
      .subscribe({
        next: (res: any) => {
          const newComment = {
            ...res,
            author: {
              _id: currentUser.id,
              name: currentUser.name,
              role: currentUser.role,
              image: currentUser.image,
            },
          };

          this.comments = [newComment, ...this.comments];
          this.newComment = '';
        },
      });
  }
  editComment(comment: any) {
    this.editingCommentId = comment._id;
    this.editText = comment.text;
  }

  updateComment(id: string) {
    if (!this.editText.trim()) return;

    this.commentService.updateComment(id, { text: this.editText }).subscribe({
      next: (updated: any) => {
        const index = this.comments.findIndex((c) => c._id === id);

        if (index !== -1) {
          this.comments[index] = {
            ...this.comments[index],

            // ONLY update text
            text: updated.text,

            // keep old populated author
            author: this.comments[index].author,
          };
        }

        this.comments = [...this.comments];

        this.editingCommentId = null;

        this.editText = '';
      },

      error: (err) => console.error('Update comment error:', err),
    });
  }
  deleteComment(id: string) {
    this.commentService.deleteComment(id).subscribe({
      next: () => {
        this.comments = this.comments.filter((c) => c._id !== id);
      },
      error: (err) => console.error('Delete comment error:', err),
    });
  }

  isOwner(comment: any): boolean {
    const userId = this.authService.user?.id;

    const authorId =
      comment.author?._id ||
      comment.addedBy?._id ||
      comment.author ||
      comment.addedBy;

    return String(authorId) === String(userId);
  }

  trackById(index: number, item: any) {
    return item._id + '_' + (item.author?.image || '');
  }

  getCommentImage(comment: any): string | null {
    const img = comment.author?.image || comment.addedBy?.image || null;

    if (!img) return null;

    if (img.startsWith('http')) return img;

    return `http://localhost:5000${img}`;
  }

  /* ================= TASK ACTIONS ================= */

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
      next: () => this.router.navigate(['/dashboard/tasks']),
      error: () => console.error('Delete failed'),
    });
  }
}
