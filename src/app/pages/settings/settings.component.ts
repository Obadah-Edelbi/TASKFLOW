import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ImageCropperComponent } from 'ngx-image-cropper';
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  isDark = false;
  language = 'English';
  emailNotif = true;
  pushNotif = false;

  open = false;
  languages = 'English';

  selectLang(lang: string) {
    this.languages = lang;
    this.open = false;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}
  toggleTheme() {
    this.isDark = !this.isDark;

    document.body.classList.toggle('dark', this.isDark);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
