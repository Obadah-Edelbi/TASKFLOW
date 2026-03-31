import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-create-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
  ],
  templateUrl: './create-task-dialog.component.html',
  styleUrl: './create-task-dialog.component.scss',
})
export class CreateTaskDialogComponent implements OnInit {
  id: string | null = null;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      priority: ['medium', Validators.required],
      status: ['new'], // default always new
    });

    // If editing → patch values
    if (this.data) {
      this.id = this.data._id;

      this.form.patchValue({
        title: this.data.title,
        description: this.data.description,
        priority: this.data.priority,
        status: this.data.status,
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Force status to 'new' when creating
    const payload = {
      ...this.form.value,
      status: this.id ? this.form.value.status : 'new',
    };

    this.dialogRef.close({
      id: this.id,
      ...payload,
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
