import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'app-edit-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './edit-task-dialog.component.html',
  styleUrl: './edit-task-dialog.component.scss',
})
export class EditTaskDialogComponent {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: [this.data.title, [Validators.required, Validators.minLength(3)]],
      description: [
        this.data.description,
        [Validators.required, Validators.minLength(3)],
      ],
      priority: [this.data.priority, Validators.required],
      status: [this.data.status, Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close({
      id: this.data._id,
      ...this.form.value,
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
