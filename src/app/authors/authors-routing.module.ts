import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorsListPage } from './pages/authors-list/authors-list.page';

const routes: Routes = [
  {
    path: '',
    component: AuthorsListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthorsRoutingModule { } 