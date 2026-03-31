import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import Swal from 'sweetalert2';

import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
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

  zoom = 1;
  // ================= CROPPER =================
  imageChangedEvent: any = null;
  croppedImage: Blob | null = null;
  showCropper = false;

  transform: any = {
    scale: 0.5,
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    if (this.authService.user) {
      this.user = { ...this.authService.user };
      this.originalUser = { ...this.authService.user };
    }
  }

  // ================= SELECT IMAGE =================
  onFileSelected(event: any): void {
    console.log('FILE SELECTED 📸');

    this.imageChangedEvent = event;
    this.showCropper = true;

    this.transform = { scale: 1 }; // reset zoom
    this.croppedImage = null;
  }

  // ================= IMAGE LOADED =================
  imageLoaded(): void {
    console.log('IMAGE LOADED ✅');

    // مهم ليشتغل cropper صح
    setTimeout(() => {
      this.transform = { scale: 1.01 };
    }, 50);
  }

  // ================= CROPPED =================
  imageCropped(event: ImageCroppedEvent): void {
    if (event.blob) {
      this.croppedImage = event.blob;

      // 🔥 preview مباشر مثل React
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

    // 🔥 add this (for slider progress fill)
    const percent = ((value - 1) / (3 - 1)) * 100;
    event.target.style.setProperty('--value', percent + '%');
  }

  // ================= SAVE CROPPED IMAGE =================
  saveCropped(): void {
    console.log('CLICK APPLY 🚀', this.croppedImage);

    if (!this.croppedImage) {
      console.log('❌ NO IMAGE');

      Swal.fire({
        icon: 'error',
        title: 'Image not ready',
        text: 'Please move or zoom the image first',
      });

      return;
    }

    this.loading = true;

    const formData = new FormData();
    formData.append('image', this.croppedImage, 'avatar.png');

    this.userService.uploadImage(formData).subscribe({
      next: (res: any) => {
        console.log('UPLOAD SUCCESS ✅', res);

        this.user.image = res.imageUrl + '?t=' + Date.now();
        localStorage.setItem('user', JSON.stringify(this.user));

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
      error: (err) => {
        console.log('UPLOAD ERROR ❌', err);

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
        console.log(res); // 👈 حطها
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
