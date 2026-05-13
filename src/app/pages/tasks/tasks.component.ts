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

type TaskStatus = 'new' | 'in_progress' | 'resolved' | 'rejected';

interface TasksResponse {
  tasks?: Task[];
}

interface NotificationPayload {
  type: 'TASK_UPDATED' | 'NEW_MESSAGE';
  taskId?: string;
  status?: TaskStatus;
}

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
  filterStatus: 'all' | TaskStatus = 'all';

  pageIndex = 0;
  pageSize = 6;

  constructor(
    private tasksService: TasksService,
    private notificationService: NotificationService,
    private toastr: ToastrService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  /* ================= INIT ================= */
  ngOnInit(): void {
    this.load();
    this.listenToNotifications();
  }

  private listenToNotifications(): void {
    this.notificationService.onNotification((data: NotificationPayload) => {
      console.log('notification', data);
      if (data.type === 'TASK_UPDATED' && data.taskId && data.status) {
        this.updateTaskStatus(data.taskId, data.status);
        this.tasks = [...this.tasks];
      }

      if (data.type === 'NEW_MESSAGE') {
        console.log('💬 New message:', data);
      }
    });
  }

  /* ================= LOAD ================= */
  load(): void {
    this.loading = true;

    this.tasksService.getAll().subscribe({
      next: (res: Task[] | TasksResponse) => {
        this.tasks = Array.isArray(res) ? res : (res.tasks ?? []);
        this.tasksService.setTasks(this.tasks);
        this.applyFilters();
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  /* ================= CREATE ================= */
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

  /* ================= DELETE ================= */
  deleteTask(task: Task): void {
    Swal.fire({
      title: 'Delete task?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff8c42',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      background: this.isDarkMode ? '#1f2937' : '#fff',
      color: this.isDarkMode ? '#f9fafb' : '#000',
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

  get isDarkMode(): boolean {
    return localStorage.getItem('theme') === 'dark';
  }

  /* ================= FILTERS ================= */
  onSearch(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  onStatusChange(value: 'all' | TaskStatus): void {
    this.filterStatus = value;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterStatus = 'all';
    this.applyFilters();
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();
    const status = this.filterStatus;

    this.filteredTasks = this.tasks.filter((task) => {
      const title = task.title?.toLowerCase() ?? '';
      const description = task.description?.toLowerCase() ?? '';

      const matchesSearch =
        !search || title.includes(search) || description.includes(search);

      const matchesStatus =
        status === 'all' || (task.status ?? 'new') === status;

      return matchesSearch && matchesStatus;
    });

    this.pageIndex = 0;
    this.applyPaging();
  }

  /* ================= PAGINATION ================= */
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTasks.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  goToPage(index: number): void {
    this.pageIndex = index;
    this.applyPaging();
  }

  prevPage(): void {
    if (this.pageIndex === 0) return;
    this.pageIndex--;
    this.applyPaging();
  }

  nextPage(): void {
    if (this.pageIndex >= this.totalPages - 1) return;
    this.pageIndex++;
    this.applyPaging();
  }

  private applyPaging(): void {
    const start = this.pageIndex * this.pageSize;
    this.pagedTasks = this.filteredTasks.slice(start, start + this.pageSize);
  }

  /* ================= REALTIME ================= */
  updateTaskStatus(taskId: string, status: TaskStatus): void {
    const task = this.tasks.find((t) => t._id === taskId);

    if (!task) return;

    task.status = status;

    this.tasks = [...this.tasks];
    this.applyFilters();
  }

  /* ================= HELPERS ================= */
  statusLabel(status?: string): string {
    return (status ?? 'new').replace('_', ' ').toUpperCase();
  }

  formatDate(value?: string): string {
    if (!value) return '-';

    const date = new Date(value);
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
  }

  formatTime(value?: string): string {
    if (!value) return '';

    const date = new Date(value);

    return isNaN(date.getTime())
      ? ''
      : date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
  }

  /* ================= EDIT ================= */
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

  openDetails(task: Task): void {
    this.router.navigate(['/dashboard/tasks', task._id]);
  }

  trackById(index: number, task: Task): string {
    return task._id;
  }

  /* ================= STATS ================= */

  get highPriorityCount(): number {
    return this.tasks.filter((task) => task.priority === 'high').length;
  }

  get mediumPriorityCount(): number {
    return this.tasks.filter((task) => task.priority === 'medium').length;
  }

  get lowPriorityCount(): number {
    return this.tasks.filter((task) => task.priority === 'low').length;
  }

  get completedCount(): number {
    return this.tasks.filter((task) => task.status === 'resolved').length;
  }
}
