import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { TasksService } from '../core/services/tasks.service';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  tasks: any[] = [];
  loading = false;

  stats: any = {
    total: 0,
    new: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
  };

  constructor(private tasksService: TasksService) {}

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

  // ================= CHANGE STATUS =================

  changeStatus(task: any, status: string) {
    const oldStatus = task.status;

    // 🔥 optimistic update (instant UI)
    task.status = status;

    this.tasksService.updateStatus(task._id, status).subscribe({
      next: () => {
        this.loadStats(); // only update stats
      },

      error: () => {
        // ❌ revert if failed
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
          this.tasks = this.tasks.filter((t) => t._id !== task._id);
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
  applyFilter(value: string) {
    const filterValue = value.trim().toLowerCase();

    // ✅ if empty → restore all data
    if (!filterValue) {
      this.tasks = [...this.tasks];
      return;
    }

    // ✅ filter normally
    this.tasks = this.tasks.filter(
      (t) =>
        (t.title || '').toLowerCase().includes(filterValue) ||
        (t.description || '').toLowerCase().includes(filterValue),
    );
  }
}
