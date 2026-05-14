import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { TasksService } from '../core/services/tasks.service';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  tasks: any[] = [];
  allTasks: any[] = [];

  // ================= PAGINATION =================

  filteredTasks: any[] = [];

  pagedTasks: any[] = [];

  pageIndex = 0;

  pageSize = 5;

  pages: number[] = [];

  totalPages = 0;

  loading = false;

  stats: any = {
    total: 0,
    new: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
  };

  constructor(
    private tasksService: TasksService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadStats();
  }

  // ================= LOAD TASKS =================

  loadTasks() {
    this.loading = true;

    this.tasksService.getAllAdmin().subscribe({
      next: (res: any) => {
        this.tasks = res.tasks || [];

        this.allTasks = [...this.tasks];

        // PAGINATION
        this.filteredTasks = [...this.tasks];

        this.updatePagination();

        this.loading = false;
      },

      error: (err: any) => {
        console.error(err);

        this.loading = false;
      },
    });
  }

  // ================= LOAD STATS =================

  loadStats() {
    this.tasksService.getAdminStats().subscribe({
      next: (res: any) => {
        this.stats = res;
      },

      error: (err: any) => console.error(err),
    });
  }

  // ================= FORMAT DATE =================

  formatDate(value?: string): string {
    if (!value) return '-';

    const date = new Date(value);

    return isNaN(date.getTime())
      ? '-'
      : date.toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
  }

  // ================= FORMAT TIME =================

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

  // ================= CHANGE STATUS =================

  changeStatus(task: any, status: string) {
    const oldStatus = task.status;

    // optimistic update
    task.status = status;

    this.tasksService.updateStatus(task._id, status).subscribe({
      next: () => {
        this.loadStats();
      },

      error: () => {
        task.status = oldStatus;
      },
    });
  }

  // ================= DELETE TASK =================

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

      this.tasksService.deleteAsAdmin(task._id).subscribe({
        next: () => {
          this.tasks = this.allTasks.filter((t) => t._id !== task._id);

          this.allTasks = [...this.tasks];

          this.filteredTasks = [...this.tasks];

          this.updatePagination();

          this.loadStats();

          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Task has been removed.',
            timer: 1500,
            showConfirmButton: false,
          });
        },

        error: (err: any) => {
          console.error(err);

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to delete task',
          });
        },
      });
    });
  }

  // ================= FILTER =================

  applyFilter(value: string) {
    const filterValue = value.trim().toLowerCase();

    if (!filterValue) {
      this.filteredTasks = [...this.allTasks];
    } else {
      this.filteredTasks = this.allTasks.filter(
        (t) =>
          (t.title || '').toLowerCase().includes(filterValue) ||
          (t.description || '').toLowerCase().includes(filterValue),
      );
    }

    this.pageIndex = 0;

    this.updatePagination();
  }

  // ================= PAGINATION =================

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredTasks.length / this.pageSize);

    this.pages = Array.from({ length: this.totalPages }, (_, i) => i);

    const start = this.pageIndex * this.pageSize;

    const end = start + this.pageSize;

    this.pagedTasks = this.filteredTasks.slice(start, end);
  }

  // ================= GO TO PAGE =================

  goToPage(index: number) {
    this.pageIndex = index;

    this.updatePagination();
  }

  // ================= NEXT PAGE =================

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;

      this.updatePagination();
    }
  }

  // ================= PREVIOUS PAGE =================

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;

      this.updatePagination();
    }
  }

  // ================= OPEN DETAILS =================

  openDetails(task: any): void {
    console.log('OPEN', task._id);

    this.router.navigate(['/dashboard/tasks', task._id]);
  }
}
