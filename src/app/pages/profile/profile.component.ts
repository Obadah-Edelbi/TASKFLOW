import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import Swal from 'sweetalert2';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { TasksService } from '../../core/services/tasks.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    ImageCropperComponent,
    MatProgressSpinner,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  // ================= USER =================
  user: any = {};
  originalUser: any = {};

  editMode = false;
  loading = false;

  // ================= COUNTS =================
  tasksCount = 0;
  projectsCount = 0;
  animateTasks = false;

  // ================= CROPPER =================
  zoom = 1;
  imageChangedEvent: any = null;
  croppedImage: Blob | null = null;
  showCropper = false;

  transform: any = {
    scale: 0.5,
  };

  constructor(
    private authService: AuthService,
    public userService: UserService,
    private taskService: TasksService,
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    // USER
    this.userService.getMe().subscribe((user: any) => {
      this.user = {
        ...user,
        image: user.image?.startsWith('http')
          ? user.image
          : 'http://localhost:5000' + user.image,
      };

      this.originalUser = { ...this.user };
    });

    // 🔥 THIS IS THE IMPORTANT PART
    this.taskService.getAll().subscribe((res: any) => {
      console.log('🔥 API RESPONSE:', res);

      const tasks = Array.isArray(res) ? res : res.tasks;

      this.taskService.setTasks(tasks || []);
    });

    // REALTIME COUNT
    this.taskService.tasks$.subscribe((tasks) => {
      this.tasksCount = tasks.length;

      this.animateTasks = true;
      setTimeout(() => (this.animateTasks = false), 300);
    });
  }

  // ================= IMAGE SELECT =================
  onFileSelected(event: any): void {
    this.imageChangedEvent = event;
    this.showCropper = true;

    this.transform = { scale: 1 };
    this.croppedImage = null;
  }

  // ================= IMAGE LOADED =================
  imageLoaded(): void {
    setTimeout(() => {
      this.transform = { scale: 1.01 };
    }, 50);
  }

  // ================= CROPPED =================
  imageCropped(event: ImageCroppedEvent): void {
    if (event.blob) {
      this.croppedImage = event.blob;

      // preview instantly
      this.user.image = URL.createObjectURL(event.blob);
    }
  }

  // ================= ZOOM =================
  zoomChanged(event: any): void {
    const value = parseFloat(event.target.value);

    this.transform = {
      ...this.transform,
      scale: value,
    };

    const percent = ((value - 1) / (3 - 1)) * 100;
    event.target.style.setProperty('--value', percent + '%');
  }

  // ================= SAVE CROPPED IMAGE =================
  saveCropped(): void {
    if (!this.croppedImage) {
      Swal.fire({
        icon: 'error',
        title: 'Image not ready',
      });
      return;
    }

    this.loading = true;

    const formData = new FormData();
    formData.append('image', this.croppedImage, 'avatar.png');

    this.userService.uploadImage(formData).subscribe({
      next: (res: any) => {
        // ✅ preview update
        this.user.image =
          'http://localhost:5000' + res.imageUrl + '?t=' + Date.now();

        // ✅ update global user
        this.userService.getMe().subscribe((user) => {
          this.userService.setUser(user);
        });

        this.resetCropper();
        this.loading = false;

        Swal.fire({
          icon: 'success',
          title: 'Avatar updated',
          toast: true,
          position: 'bottom-end',
          timer: 2000,
          showConfirmButton: false,
        });
      },
      error: () => {
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Upload failed',
        });
      },
    });
  }

  // ================= RESET =================
  resetCropper(): void {
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImage = null;
    this.transform = { scale: 1 };
  }

  // ================= SAVE PROFILE =================
  save(): void {
    this.loading = true;

    this.userService.updateProfile(this.user).subscribe({
      next: (res: any) => {
        this.user = res;
        this.originalUser = { ...res };

        localStorage.setItem('user', JSON.stringify(res));

        this.editMode = false;
        this.loading = false;

        Swal.fire({
          icon: 'success',
          title: 'Profile saved',
          toast: true,
          position: 'bottom-end',
          timer: 2000,
          showConfirmButton: false,
        });
      },
      error: () => {
        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Update failed',
        });
      },
    });
  }

  // ================= CANCEL =================
  cancelEdit(): void {
    this.user = { ...this.originalUser };
    this.editMode = false;
  }

  // ================= UTIL =================
  copyEmail(email: string) {
    if (!email) return;

    navigator.clipboard.writeText(email);
    alert('Email copied!');
  }

  openLocation(location: string) {
    if (!location) return;

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  }
}
