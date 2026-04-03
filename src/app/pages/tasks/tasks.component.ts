import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Task } from '../../core/models/task.model';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { TasksService } from '../../core/services/tasks.service';
import { NotificationService } from '../../core/services/notification.service';
import { CreateTaskDialogComponent } from './create-task-dialog/create-task-dialog.component';
import { EditTaskDialogComponent } from './edit-task-dialog/edit-task-dialog.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent implements OnInit {
  loading = false;

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  pagedTasks: Task[] = [];

  searchTerm = '';
  filterStatus: 'all' | 'new' | 'in_progress' | 'resolved' | 'rejected' = 'all';

  pageIndex = 0;
  pageSize = 6;

  constructor(
    private tasksService: TasksService,
    private notificationService: NotificationService,
    private toastr: ToastrService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.load();

    // 🔥 REALTIME FIX (بدون reload)
    this.notificationService.onNotification((data: any) => {
      if (data.type === 'TASK_UPDATED') {
        this.updateTaskStatus(
          data.taskId,
          data.status as 'new' | 'in_progress' | 'resolved' | 'rejected',
        );
      }
    });

    this.notificationService.onNotification((data: any) => {
      console.log('🔥 GOT NOTIFICATION:', data);

      // 🔥 TASK UPDATE
      if (data.type === 'TASK_UPDATED') {
        this.updateTaskStatus(
          data.taskId,
          data.status as 'new' | 'in_progress' | 'resolved' | 'rejected',
        );
      }

      // 💬 NEW MESSAGE
      if (data.type === 'NEW_MESSAGE') {
        console.log('💬 New message:', data);
      }
    });
  }

  // ================= LOAD =================
  load(): void {
    this.loading = true;

    this.tasksService.getAll().subscribe({
      next: (res: any) => {
        this.tasks = Array.isArray(res) ? res : res.tasks || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  trackByTask(index: number, task: any) {
    return task._id;
  }

  // ================= CREATE =================
  createTask(): void {
    const dialogRef = this.dialog.open(CreateTaskDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: true,
      panelClass: 'modern-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.tasksService.create(result).subscribe({
        next: () => {
          this.toastr.success('Task created');
          this.load();
        },
        error: () => this.toastr.error('Failed to create task'),
      });
    });
  }

  // ================= DELETE =================
  deleteTask(task: any) {
    Swal.fire({
      title: 'Delete task?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff8c42',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (!result.isConfirmed) return;

      task.removing = true;

      setTimeout(() => {
        this.tasksService.delete(task._id).subscribe({
          next: () => {
            this.tasks = this.tasks.filter((t) => t._id !== task._id);
            this.filteredTasks = this.filteredTasks.filter(
              (t) => t._id !== task._id,
            );

            this.applyFilters();

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Task has been removed.',
              timer: 1500,
              showConfirmButton: false,
            });
          },
          error: () => {
            task.removing = false;

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete task',
            });
          },
        });
      }, 300);
    });
  }

  // ================= FILTERS =================
  onSearch(value: string) {
    this.searchTerm = value;
    this.applyFilters();
  }

  onStatusChange(value: typeof this.filterStatus) {
    this.filterStatus = value;
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterStatus = 'all';
    this.applyFilters();
  }

  applyFilters() {
    const s = this.searchTerm.trim().toLowerCase();
    const st = this.filterStatus;

    this.filteredTasks = this.tasks.filter((t: Task) => {
      const title = t.title?.toLowerCase() ?? '';
      const desc = t.description?.toLowerCase() ?? '';

      return (
        (!s || title.includes(s) || desc.includes(s)) &&
        (st === 'all' || (t.status ?? 'new') === st)
      );
    });

    this.pageIndex = 0;
    this.applyPaging();
  }

  // ================= PAGINATION =================
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTasks.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  goToPage(i: number) {
    this.pageIndex = i;
    this.applyPaging();
  }

  prevPage() {
    if (this.pageIndex === 0) return;
    this.pageIndex--;
    this.applyPaging();
  }

  nextPage() {
    if (this.pageIndex >= this.totalPages - 1) return;
    this.pageIndex++;
    this.applyPaging();
  }

  private applyPaging() {
    const start = this.pageIndex * this.pageSize;
    this.pagedTasks = this.filteredTasks.slice(start, start + this.pageSize);
  }

  // ================= REALTIME UPDATE =================
  updateTaskStatus(taskId: string, status: any) {
    const task = this.tasks.find((t) => t._id === taskId);

    if (task) {
      task.status = status;
      this.applyFilters();
    }
  }

  // ================= HELPERS =================
  statusLabel(status?: string): string {
    return (status ?? 'new').replace('_', ' ').toUpperCase();
  }

  formatDate(d?: string): string {
    if (!d) return '-';
    const date = new Date(d);
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
  }

  formatTime(d?: string): string {
    if (!d) return '';
    const date = new Date(d);
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  openEditDialog(task: Task): void {
    this.dialog
      .open(EditTaskDialogComponent, {
        width: '600px',
        maxWidth: '95vw',
        disableClose: true,
        panelClass: 'modern-dialog',
        data: task,
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;

        this.tasksService.update(task._id, result).subscribe({
          next: () => {
            this.toastr.success('Task updated');
            this.load();
          },
          error: () => {
            this.toastr.error('Failed to update task');
          },
        });
      });
  }

  // ================= STATS =================

  get totalTasks(): number {
    return this.tasks.length;
  }

  get inProgressCount(): number {
    return this.tasks.filter((t) => t.status === 'in_progress').length;
  }

  get completedCount(): number {
    return this.tasks.filter((t) => t.status === 'resolved').length;
  }

  get highPriorityCount(): number {
    return this.tasks.filter((t) => t.priority === 'high').length;
  }
  openDetails(task: any) {
    this.router.navigate(['/dashboard/tasks', task._id]);
  }
}
