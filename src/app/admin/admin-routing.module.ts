import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AdminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.page')
          .then(m => m.AdminDashboardPage)
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/user-management/user-management.page')
          .then(m => m.UserManagementPage)
      },
      {
        path: 'role-requests',
        loadComponent: () => import('./pages/role-requests/role-requests.page')
          .then(m => m.RoleRequestsPage)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { } 