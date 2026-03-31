import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
  ) {}

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit() {
    if (this.form.invalid) return;

    const email = this.form.value.email || '';
    this.authService.forgotPassword({ email }).subscribe({
      next: (res: any) => {
        this.toastr.success(res.message || 'Reset link sent');
        this.form.reset();
      },

      error: (err) => {
        if (err.status === 404) {
          this.toastr.error('User not found');
        } else {
          this.toastr.error('Something went wrong');
        }

        console.error(err);
      },
    });
  }
}
