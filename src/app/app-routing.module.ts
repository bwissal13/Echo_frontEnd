import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { VerifyEmailComponent } from './auth/components/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './auth/components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/components/reset-password/reset-password.component';
import { BookEditorComponent } from './books/components/book-editor/book-editor.component';
import { ChapterReadPage } from './books/pages/chapter-read/chapter-read.page';
import { ProfileComponent } from './auth/components/profile/profile.component';
import { AdminRoutingModule } from './admin/admin-routing.module';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./public/public.module').then(m => m.PublicModule),
    pathMatch: 'prefix'
  },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'verify-email', component: VerifyEmailComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'books',
        children: [
          {
            path: '',
            loadComponent: () => import('./books/components/book-list/book-list.component')
              .then(m => m.BookListComponent),
            canActivate: [AuthGuard]
          },
          {
            path: 'bookmarks',
            loadComponent: () => import('./books/components/bookmarks/bookmarks.component')
              .then(m => m.BookmarksComponent),
            canActivate: [AuthGuard]
          },
          {
            path: 'new',
            component: BookEditorComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'edit/:id',
            component: BookEditorComponent,
            canActivate: [AuthGuard]
          },
          {
            path: 'public',
            loadComponent: () => import('./books/pages/public-books/public-books.page')
              .then(m => m.PublicBooksPage)
          },
          {
            path: 'public/:id',
            loadComponent: () => import('./books/pages/book-detail/book-detail.page')
              .then(m => m.BookDetailPage)
          },
          {
            path: 'chapter/:id',
            component: ChapterReadPage,
            canActivate: [AuthGuard]
          },
          {
            path: 'saved-phrases',
            loadComponent: () => import('./books/pages/saved-phrases/saved-phrases.page')
              .then(m => m.SavedPhrasesPage)
          }
        ]
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'authors',
        loadChildren: () => import('./authors/authors.module').then(m => m.AuthorsModule)
      },
      {
        path: 'admin',
        canActivate: [AuthGuard],
        loadChildren: () => import('./admin/admin-routing.module').then(m => m.AdminRoutingModule)
      },
      {
        path: 'role-request',
        loadComponent: () => import('./auth/pages/role-request/role-request.page')
          .then(m => m.RoleRequestPage),
        canActivate: [AuthGuard]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 