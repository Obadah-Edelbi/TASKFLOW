import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { Task, TasksService } from '../../core/services/tasks.service';
import { Router } from '@angular/router';

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
  displayedColumns: string[] = ['title', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Task>([]);

  constructor(
    private tasksService: TasksService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;

    this.tasksService.getAll().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res)
          ? res
          : res.tasks || res.data || res.items || [];

        this.dataSource.data = list;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load tasks');
      },
    });
  }

  applyFilter(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  editTask(t: any) {
    const id = t._id || t.id; // لأن عندك ظاهر id بالصورة
    this.router.navigate(['/dashboard/tasks', id, 'edit']);
  }

  async deleteTask(t: Task) {
    const result = await Swal.fire({
      title: 'Delete task?',
      text: t.title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
    });

    if (!result.isConfirmed) return;

    this.tasksService.delete(t._id).subscribe({
      next: () => {
        this.toastr.success('Task deleted');
        this.load();
      },
      error: () => this.toastr.error('Delete failed'),
    });
  }
}
