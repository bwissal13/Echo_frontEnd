import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookCardComponent } from '../../../shared/components/book-card/book-card.component';
import { BookmarkService, BookmarkGroup } from '../../../shared/services/bookmark.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, BookCardComponent],
  template: `
    <div class="bookmarks-container">
      <div class="header">
        <h2>My Bookmarks</h2>
      </div>

      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <ng-container *ngIf="!loading">
        <div class="groups-container" *ngIf="bookmarkGroups.length > 0">
          <div *ngFor="let group of bookmarkGroups" class="bookmark-group">
            <div class="group-header">
              <h3>{{group.name}}</h3>
              <span class="book-count">{{group.books.length}} books</span>
            </div>
            
            <div class="books-grid">
              <app-book-card 
                *ngFor="let book of group.books"
                [book]="book"
                [imageUrl]="getImageUrl(book.coverImage)"
              ></app-book-card>
            </div>
          </div>
        </div>

        <div *ngIf="bookmarkGroups.length === 0" class="empty-state">
          <mat-icon>bookmark_border</mat-icon>
          <p>No bookmarks yet</p>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .bookmarks-container {
      padding: 24px;
    }

    .header {
      margin-bottom: 24px;

      h2 {
        font-size: 24px;
        font-weight: 500;
        color: #1a1a1a;
      }
    }

    .groups-container {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .bookmark-group {
      .group-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;

        h3 {
          font-size: 18px;
          font-weight: 500;
          color: #1a1a1a;
        }

        .book-count {
          color: #666;
          font-size: 14px;
        }
      }

      .books-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 20px;
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: #666;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }

      p {
        font-size: 16px;
      }
    }

    .loading-state {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
  `]
})
export class BookmarksComponent implements OnInit {
  bookmarkGroups: BookmarkGroup[] = [];
  loading = true;

  constructor(
    private bookmarkService: BookmarkService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBookmarkGroups();
  }

  loadBookmarkGroups() {
    this.loading = true;
    this.bookmarkService.getBookmarkGroups().subscribe({
      next: (groups) => {
        this.bookmarkGroups = groups;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(error, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        if (error.includes('Please login')) {
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: '/books/bookmarks' }
          });
        }
      }
    });
  }

  getImageUrl(coverImage: string | null): string {
    return coverImage || 'assets/images/default-book-cover.jpg';
  }
} 