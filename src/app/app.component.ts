import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './pages/navbar/navbar.component';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');

    if (userId) {
      this.notificationService.connect(userId);
    }

    this.applyTheme();
  }

  applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    const mode = localStorage.getItem('themeMode');

    // 🔥 إذا المستخدم مختار يدوي → استخدمه
    if (mode === 'manual' && savedTheme) {
      if (savedTheme === 'dark') {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
      return;
    }

    // 🔥 AUTO MODE (ليل / نهار)
    const hour = new Date().getHours();

    const isNight = hour >= 18 || hour < 6;

    if (isNight) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    // خزّن auto mode
    localStorage.setItem('themeMode', 'auto');
  }
}
