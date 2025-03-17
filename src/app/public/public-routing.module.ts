import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  // Add other public routes here as needed
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { } 