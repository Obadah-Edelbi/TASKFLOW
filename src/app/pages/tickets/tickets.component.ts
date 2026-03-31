import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { TasksService } from '../../core/services/tasks.service';
import { Task } from '../../core/models/task.model';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
  ],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss',
})
export class TicketsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  loading = false;

  displayedColumns: string[] = [
    'title',
    'priority',
    'status',
    'createdAt',
    'actions',
  ];

  dataSource = new MatTableDataSource<Task>([]);

  constructor(
    private tasksService: TasksService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadTasks();

    // 🔥 فلترة حسب title فقط
    this.dataSource.filterPredicate = (data: Task, filter: string) =>
      data.title.toLowerCase().includes(filter);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // ================= LOAD =================
  loadTasks(): void {
    this.loading = true;

    this.tasksService.getAll().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : res.tasks || [];

        this.dataSource.data = list;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load tasks');
      },
    });
  }

  // ================= FILTER =================
  applyFilter(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  // ================= NAVIGATION =================
  openDetails(task: Task) {
    this.router.navigate(['/dashboard/tasks', task._id]);
  }

  editTask(task: Task) {
    this.router.navigate(['/dashboard/tasks', task._id, 'edit']);
  }

  // ================= DELETE =================
  async deleteTask(task: Task) {
    const result = await Swal.fire({
      title: 'Delete task?',
      text: task.title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
    });

    if (!result.isConfirmed) return;

    this.tasksService.delete(task._id).subscribe({
      next: () => {
        this.toastr.success('Task deleted');
        this.loadTasks();
      },
      error: () => this.toastr.error('Delete failed'),
    });
  }
}
