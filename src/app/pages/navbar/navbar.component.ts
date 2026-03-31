import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    MatMenuModule,
    RouterLink,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient,
    private notificationService: NotificationService,
  ) {}

  notifications: any[] = [];
  unreadCount = 0;
  showDropdown = false;

  showUserMenu = false;
  activeTab = 'Tasks';
  visibleNavLinks: any[] = [];

  // ================= INIT =================
  ngOnInit() {
    this.buildNavLinks();

    // 🔥 REALTIME (عن طريق service فقط)
    this.notificationService.onNotification((notif: any) => {
      const exists = this.notifications.some((n) => n._id === notif._id);
      if (exists) return;

      const newNotif = {
        ...notif,
        read: false,

        // 🔥 fix NaN نهائي
        createdAt: notif.createdAt ? new Date(notif.createdAt) : new Date(),
      };

      this.notifications.unshift(newNotif);
      this.unreadCount++;

      this.toastr.info(notif.message);
    });
  }

  // ================= LOAD =================

  // ================= DROPDOWN =================
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;

    if (this.showDropdown) {
      this.markAllAsRead();
    }
  }
  // ================= READ =================
  markAllAsRead() {
    this.notifications.forEach((n) => {
      if (!n.read) {
        this.http
          .put(`http://localhost:5000/api/notifications/${n._id}/read`, {})
          .subscribe();
      }
      n.read = true;
    });

    this.unreadCount = 0;
  }

  markOneAsRead(index: number) {
    const notif = this.notifications[index];

    if (notif.read) return;

    this.http
      .put(`http://localhost:5000/api/notifications/${notif._id}/read`, {})
      .subscribe();

    notif.read = true;
    this.unreadCount = this.notifications.filter((n) => !n.read).length;
  }

  clearAll() {
    this.notifications = [];
    this.unreadCount = 0;
  }

  // ================= UX =================
  playSound() {
    const audio = new Audio('assets/notification-sound/notification.mp3');
    audio.play().catch(() => {});
  }

  triggerBell() {
    const btn = document.querySelector('.notification-btn');
    btn?.classList.add('has-new');

    setTimeout(() => {
      btn?.classList.remove('has-new');
    }, 300);
  }

  timeAgo(date: Date) {
    if (!date) return 'now';

    const d = new Date(date);
    if (isNaN(d.getTime())) return 'now';

    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

    if (seconds < 60) return 'now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hr ago';

    return Math.floor(seconds / 86400) + ' day ago';
  }

  // ================= NAV =================
  buildNavLinks() {
    this.visibleNavLinks = [
      { name: 'Tasks', icon: 'assignment', route: '/dashboard/tasks' },
    ];

    if (this.isAdmin) {
      this.visibleNavLinks.push({
        name: 'Admin',
        icon: 'admin_panel_settings',
        route: '/dashboard/admin',
      });
    }
  }

  get isAdmin(): boolean {
    return this.authService.user?.role === 'admin';
  }

  setActiveTab(name: string, route: string) {
    this.activeTab = name;
    this.router.navigate([route]);
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
  }

  @HostListener('document:click')
  closeMenu() {
    this.showUserMenu = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme() {
    const isDark = document.body.classList.toggle('dark');

    // 🔥 خزّن اختيار المستخدم
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // 🔥 علّم إنه manual override
    localStorage.setItem('themeMode', 'manual');
  }

  get username(): string {
    return this.authService.user?.name ?? '';
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }
}
