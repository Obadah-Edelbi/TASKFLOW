import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

import { DashboardLayoutComponent } from './pages/dashboard-layout/dashboard-layout.component';

import { TasksComponent } from './pages/tasks/tasks.component';
import { TaskFormComponent } from './pages/tasks/task-form/task-form.component';
import { TaskDetailsComponent } from './pages/tasks/task-details/task-details.component';

import { TicketsComponent } from './pages/tickets/tickets.component';

import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

import { authGuard } from './core/gaurds/auth.gaurd';
import { adminGuard } from './core/gaurds/admin.gaurd';

export const routes: Routes = [
  // ================= AUTH =================
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // ================= DASHBOARD =================
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      // default
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },

      // ================= TASKS =================
      { path: 'tasks', component: TasksComponent },
      { path: 'tasks/new', component: TaskFormComponent },
      { path: 'tasks/:id', component: TaskDetailsComponent },
      { path: 'tasks/:id/edit', component: TaskFormComponent },

      // ================= PROFILE =================
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
      },

      // ================= SETTINGS =================
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.component').then(
            (m) => m.SettingsComponent,
          ),
      },

      // ================= TICKETS =================
      { path: 'tickets', component: TicketsComponent },

      // ================= ADMIN =================
      {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [adminGuard],
      },
    ],
  },

  // ================= FALLBACK =================
  { path: '**', redirectTo: 'login' },
];
