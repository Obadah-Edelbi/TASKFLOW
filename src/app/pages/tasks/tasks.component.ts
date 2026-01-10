import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { Task, TasksService } from '../../core/services/tasks.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent implements OnInit {
  loading = false;

  // server data
  tasks: Task[] = [];

  // filtered + paged
  filteredTasks: Task[] = [];
  pagedTasks: Task[] = [];

  // filters
  searchTerm = '';
  filterStatus: 'all' | 'new' | 'in_progress' | 'resolved' | 'rejected' = 'all';

  // pagination (like screenshot)
  pageIndex = 0;
  pageSize = 6;

  constructor(
    private tasksService: TasksService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;

    this.tasksService.getAll().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : res?.tasks || res?.data || [];
        this.tasks = Array.isArray(list) ? list : [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load tasks');
      },
    });
  }

  // ======= UI actions =======
  createTask() {
    this.router.navigate(['/dashboard/tasks/new']);
  }

  openDetails(t: any) {
    const id = t._id || t.id;
    // use what you already have
    this.router.navigate(['/dashboard/ticket-details', id]);
  }

  editTask(t: any) {
    const id = t._id || t.id;
    this.router.navigate(['/dashboard/tasks', id, 'edit']);
  }

  async deleteTask(t: any) {
    const id = t._id || t.id;

    const result = await Swal.fire({
      title: 'Delete task?',
      text: t.title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
    });

    if (!result.isConfirmed) return;

    this.tasksService.delete(id).subscribe({
      next: () => {
        this.toastr.success('Task deleted');
        this.load();
      },
      error: () => this.toastr.error('Delete failed'),
    });
  }

  // ======= filters =======
  onSearch(value: string) {
    this.searchTerm = value;
    this.applyFilters();
  }

  onStatusChange(value: any) {
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

    this.filteredTasks = this.tasks.filter((t: any) => {
      const title = (t.title || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();

      const matchesSearch = !s || title.includes(s) || desc.includes(s);
      const matchesStatus = st === 'all' || (t.status || 'new') === st;

      return matchesSearch && matchesStatus;
    });

    // reset pagination to first page
    this.pageIndex = 0;
    this.applyPaging();
  }

  // ======= pagination =======
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

  // ======= stats =======
  get totalTasks() {
    return this.tasks.length;
  }
  get inProgressCount() {
    return this.tasks.filter((t: any) => t.status === 'in_progress').length;
  }
  get completedCount() {
    return this.tasks.filter((t: any) => t.status === 'resolved').length;
  }
  get highPriorityCount() {
    return this.tasks.filter((t: any) => t.priority === 'high').length;
  }

  // ======= helpers =======
  statusLabel(status: string) {
    return (status || 'new').replace('_', ' ').toUpperCase();
  }

  formatDate(d: any) {
    try {
      const date = new Date(d);
      return date.toLocaleDateString();
    } catch {
      return '-';
    }
  }

  formatTime(d: any) {
    try {
      const date = new Date(d);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  }
}
