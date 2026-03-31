import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { ToastrService } from 'ngx-toastr';
import { TasksService } from '../../../core/services/tasks.service';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent implements OnInit {
  loading = false;
  id: string | null = null;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(3)]],
    priority: ['medium', Validators.required],
    status: ['new', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private tasks: TasksService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');

    if (!this.id) return;

    this.loading = true;

    this.tasks.getById(this.id).subscribe({
      next: (task: Task) => {
        this.form.patchValue({
          title: task.title ?? '',
          description: task.description ?? '',
          priority: task.priority ?? 'medium',
          status: task.status ?? 'new',
        });

        this.loading = false;
      },

      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load task');
      },
    });
  }

  save() {
    if (this.loading) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const payload = this.form.getRawValue() as Partial<Task>;

    if (this.id) {
      this.tasks.update(this.id, payload).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/tasks']);
        },
      });
    } else {
      this.tasks.create(payload).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/tasks']);
        },
      });
    }
  }
}
