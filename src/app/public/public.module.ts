import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicRoutingModule } from './public-routing.module';
import { HomePage } from './pages/home/home.page';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PublicRoutingModule,
    HomePage // Import the standalone component
  ]
})
export class PublicModule { } 