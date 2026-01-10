import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  FormGroup,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
  ],
  providers: [FormBuilder],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private toaster: ToastrService
  ) {}

  registerForm = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  onSubmit() {
    if (this.registerForm.invalid) {
      this.toaster.error('please fix the form errors');
      return;
    }

    const { name, email, password } = this.registerForm.value;

    this.authService
      .register({
        name,
        email,
        password,
      })
      .subscribe({
        next: () => {
          this.toaster.success('Account created successfully 🎉', 'Success');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.toaster.error(err.error?.message || 'Register Failed!');
        },
      });
  }
}
