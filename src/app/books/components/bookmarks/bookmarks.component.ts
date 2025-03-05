import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookCardComponent } from '../../../shared/components/book-card/book-card.component';
import { BookmarkService, BookmarkGroup } from '../../../shared/services/bookmark.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatProgressSpinnerModule, 
    BookCardComponent,
    SidebarComponent,
    SearchBarComponent,
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <div class="page-container">
      <app-sidebar></app-sidebar>
      <div class="main-content">
        <div class="flex justify-between items-center mb-6">
          <app-search-bar></app-search-bar>
        </div>

        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div class="bookmarks-grid" *ngIf="!loading && bookmarkGroups.length > 0">
          <div *ngFor="let group of bookmarkGroups" class="bookmark-collection" (click)="openGroupBooks(group)">
            <div class="collection-preview">
              <div class="preview-images">
                <ng-container *ngFor="let book of group.books.slice(0, 3)">
                  <img [src]="getImageUrl(book.coverImage)" [alt]="book.title">
                </ng-container>
              </div>
              <div class="collection-info">
                <h3>{{ group.name }}</h3>
                <span>{{ group.books.length }} items</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && bookmarkGroups.length === 0" class="empty-state">
          <mat-icon>bookmark_border</mat-icon>
          <p>No saved items yet</p>
          <span>Save books to find them later</span>
        </div>
      </div>
    </div>

    <!-- Group Books Dialog Template -->
    <ng-template #groupBooksDialog let-data>
      <div class="dialog-container">
        <div class="dialog-header">
          <h2>{{ data.group.name }}</h2>
          <button mat-icon-button (click)="closeDialog()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <div class="books-grid">
          <app-book-card 
            *ngFor="let book of data.group.books"
            [book]="book"
            [imageUrl]="getImageUrl(book.coverImage)"
            (click)="navigateToBook(book.id)"
          ></app-book-card>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .page-container {
      display: flex;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .main-content {
      flex: 1;
      padding: 20px;
    }

    .header {
      display: flex;
      align-items: center;
      margin-bottom: 32px;
      gap: 16px;

      .bookmark-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #262626;
      }

      h1 {
        font-size: 24px;
        font-weight: 600;
        color: #262626;
        margin: 0;
      }
    }

    .bookmarks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .bookmark-collection {
      cursor: pointer;
      
      &:hover {
        .collection-preview {
          transform: translateY(-4px);
        }
      }
    }

    .collection-preview {
      border: 1px solid #dbdbdb;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s ease;
      background: white;

      .preview-images {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        aspect-ratio: 16/9;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-right: 1px solid #fff;

          &:last-child {
            border-right: none;
          }
        }
      }

      .collection-info {
        padding: 12px 16px;
        border-top: 1px solid #dbdbdb;

        h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #262626;
        }

        span {
          font-size: 12px;
          color: #737373;
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      color: #737373;
      background: white;
      border-radius: 8px;
      margin-top: 24px;

      mat-icon {
        font-size: 96px;
        width: 96px;
        height: 96px;
        margin-bottom: 24px;
      }

      p {
        font-size: 22px;
        font-weight: 300;
        margin: 0 0 8px 0;
      }

      span {
        font-size: 14px;
      }
    }

    .loading-state {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .flex {
      display: flex;
    }

    .justify-between {
      justify-content: space-between;
    }

    .items-center {
      align-items: center;
    }

    .mb-6 {
      margin-bottom: 1.5rem;
    }

    .dialog-container {
      padding: 24px;
      min-width: 600px;
      max-width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #dbdbdb;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }
    }

    .books-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 20px;
    }
  `]
})
export class BookmarksComponent implements OnInit {
  bookmarkGroups: BookmarkGroup[] = [];
  loading = true;
  @ViewChild('groupBooksDialog') groupBooksDialog!: TemplateRef<any>;

  constructor(
    private bookmarkService: BookmarkService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.loadBookmarkGroups();
    } else {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/books/bookmarks' }
      });
    }
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
        if (error.includes('Please login') || error.status === 401) {
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: '/books/bookmarks' }
          });
        }
      }
    });
  }

  openGroupBooks(group: BookmarkGroup) {
    this.dialog.open(this.groupBooksDialog, {
      data: { group },
      panelClass: 'books-dialog'
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  navigateToBook(bookId: number) {
    this.dialog.closeAll();
    this.router.navigate(['/books/edit', bookId]);
  }

  getImageUrl(coverImage: string | null): string {
    return coverImage || 'assets/images/default-book-cover.jpg';
  }
} 