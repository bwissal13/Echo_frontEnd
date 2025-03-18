import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthorsService } from '../../services/authors.service';
import { Author, AuthorsResponse } from '../../models/author.model';
import { Page } from '../../../shared/models/page.model';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
@Component({
  selector: 'app-authors-list',
  templateUrl: './authors-list.page.html',
  styleUrls: ['./authors-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatIconModule,
    RouterModule,
    SidebarComponent,
    MatButtonModule,
    BackButtonComponent
  ]
})
export class AuthorsListPage implements OnInit {
  authors: Author[] = [];
  loading = false;
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  sortField = 'firstname';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchControl = new FormControl('');

  constructor(private authorsService: AuthorsService) {}

  ngOnInit() {
    this.loadAuthors();
    this.setupSearch();
  }

  private setupSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageIndex = 0;
      this.loadAuthors();
    });
  }

  loadAuthors() {
    this.loading = true;
    const search = this.searchControl.value || '';
    
    this.authorsService.getAuthors(
      this.pageIndex,
      this.pageSize,
      this.sortField,
      this.sortDirection,
      search
    ).subscribe({
      next: (response: AuthorsResponse) => {
        this.authors = response.content;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading authors:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAuthors();
  }

  onSortChange(sort: Sort) {
    this.sortField = sort.active;
    this.sortDirection = sort.direction || 'asc';
    this.loadAuthors();
  }

  private getMockBooks(author: Author): { id: number; title: string }[] {
    return Array(author.totalBooks).fill(0).map((_, i) => ({
      id: i + 1,
      title: `${author.firstname}'s Book ${i + 1}`
    })).slice(0, Math.min(author.totalBooks, 5));
  }

  navigateToBook(bookId: number, event: Event) {
    event.stopPropagation();
    console.log('Navigating to book:', bookId);
  }

  followAuthor(authorId: number, event: Event) {
    event.stopPropagation();
    this.authorsService.toggleFollow(authorId.toString()).subscribe({
      next: (followed) => {
        console.log(followed ? 'Author followed' : 'Author unfollowed');
        this.loadAuthors();
      },
      error: (error) => {
        console.error('Error following author:', error);
      }
    });
  }
}