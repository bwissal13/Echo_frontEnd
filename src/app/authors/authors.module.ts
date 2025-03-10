import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AuthorsRoutingModule } from './authors-routing.module';
import { AuthorsService } from './services/authors.service';

@NgModule({
  imports: [
    HttpClientModule,
    AuthorsRoutingModule
  ],
  providers: [
    AuthorsService
  ]
})
export class AuthorsModule { } 