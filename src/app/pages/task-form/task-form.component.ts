import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { TasksService } from '../../core/services/tasks.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
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
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (!this.id) return;

    this.loading = true;

    this.tasks.getById(this.id).subscribe({
      next: (res: any) => {
        // backend ممكن يرجع task مباشرة أو داخل { task }
        const task = res?.task ?? res;

        this.form.patchValue({
          title: task?.title ?? '',
          description: task?.description ?? '',
          priority: task?.priority ?? 'medium',
          status: task?.status ?? 'new',
        });

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Failed to load task');
      },
    });
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const confirm = await Swal.fire({
      title: this.id ? 'Update task?' : 'Create task?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.id ? 'Update' : 'Create',
    });

    if (!confirm.isConfirmed) return;

    this.loading = true;
    const data = this.form.getRawValue() as any;

    const request$ = this.id
      ? this.tasks.update(this.id, data)
      : this.tasks.create(data);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.toastr.success(this.id ? 'Task updated' : 'Task created');

        // ✅ رجّعك عاللست مباشرة
        this.router.navigate(['/dashboard/tasks']);
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Save failed');
      },
    });
  }
}
