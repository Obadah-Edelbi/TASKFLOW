import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

import { DashboardLayoutComponent } from './pages/dashboard-layout/dashboard-layout.component';

import { TicketsComponent } from './pages/tickets/tickets.component';
import { TicketDetailsComponent } from './pages/ticket-details/ticket-details.component';

import { TasksComponent } from './pages/tasks/tasks.component';

import { AdminComponent } from './pages/admin/admin.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

import { authGuard } from './core/gaurds/auth.gaurd';
import { adminGuard } from './core/gaurds/admin.gaurd';
import { TaskFormComponent } from './pages/task-form/task-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      // default داخل الداشبورد
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },

      // ✅ Tickets (إذا بدك تضل تستخدمها)
      { path: 'tickets', component: TicketsComponent },
      { path: 'tickets/new', component: TaskFormComponent },
      { path: 'tickets/:id/edit', component: TaskFormComponent },
      { path: 'ticket-details/:id', component: TicketDetailsComponent },
      // ✅ Tasks
      { path: 'tasks', component: TasksComponent }, // الأفضل مو TicketsComponent
      { path: 'tasks/new', component: TaskFormComponent },
      { path: 'tasks/:id/edit', component: TaskFormComponent },

      { path: 'tasks/:id', component: TicketDetailsComponent },

      // ✅ Admin
      { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
      {
        path: 'admindashboard',
        component: AdminDashboardComponent,
        canActivate: [adminGuard],
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
