import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Task, TasksService } from '../../core/services/tasks.service';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './ticket-details.component.html',
  styleUrl: './ticket-details.component.scss',
})
export class TicketDetailsComponent {
  loading = false;
  task: Task | null = null;

  private id = '';

  constructor(
    private route: ActivatedRoute,
    private tasksService: TasksService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (!this.id) return;

    this.loading = true;

    this.tasksService.getById(this.id).subscribe({
      next: (res: any) => {
        // backend ممكن يرجع task مباشرة أو داخل object
        this.task = res?.task ?? res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load task');
      },
    });
  }
}
