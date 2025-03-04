import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookListComponent } from './components/book-list/book-list.component';
import { BookEditorComponent } from './components/book-editor/book-editor.component';
import { AuthorGuard } from './guards/author.guard';

const routes: Routes = [
  {
    path: '',
    component: BookListComponent
  },
  {
    path: 'new',
    component: BookEditorComponent,
    canActivate: [AuthorGuard]
  },
  {
    path: 'edit/:id',
    component: BookEditorComponent,
    canActivate: [AuthorGuard]
  }
  // ... other routes
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BooksRoutingModule { } 