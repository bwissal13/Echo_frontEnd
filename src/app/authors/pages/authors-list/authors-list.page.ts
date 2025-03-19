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
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../auth/services/auth.service';

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

  constructor(
    private authorsService: AuthorsService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

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
    
    // Check if user is authenticated first
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Please log in to follow authors', 'Go to Login', {
        duration: 5000
      }).onAction().subscribe(() => {
        // Navigate to login page
        // this.router.navigate(['/auth/login']);
      });
      return;
    }
    
    // Find the author in the list
    const authorIndex = this.authors.findIndex(author => author.id === authorId);
    if (authorIndex === -1) return;
    
    const author = this.authors[authorIndex];
    const isCurrentlyFollowing = author.isFollowing;
    
    // Optimistically update UI
    author.isFollowing = !isCurrentlyFollowing;
    
    // If currently following, unsubscribe; otherwise subscribe
    const action$ = isCurrentlyFollowing 
      ? this.authorsService.unsubscribeFromAuthor(authorId.toString())
      : this.authorsService.subscribeToAuthor(authorId.toString());
    
    action$.subscribe({
      next: (result: any) => {
        console.log(author.isFollowing ? 'Subscribed to author' : 'Unsubscribed from author');
        
        // Update follower count
        if (author.isFollowing) {
          author.totalFollowers++;
        } else {
          author.totalFollowers = Math.max(0, author.totalFollowers - 1);
        }
      },
      error: (error: any) => {
        console.error('Error updating subscription:', error);
        // Revert the optimistic update on error
        author.isFollowing = isCurrentlyFollowing;
        
        // Show error notification to user
        this.snackBar.open('Failed to update subscription status. Please try again.', 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }
}