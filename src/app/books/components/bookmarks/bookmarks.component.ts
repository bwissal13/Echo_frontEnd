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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BackButtonComponent } from '../../../shared/components/back-button/back-button.component';
@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatProgressSpinnerModule, 
    BookCardComponent,
    SidebarComponent,
    MatDialogModule,
    MatButtonModule,
    BackButtonComponent
  ],
  template: `
    <div class="page-container">
      <app-sidebar></app-sidebar>
      <div class="main-content">
      <div class="top-row">
        <app-back-button></app-back-button>
        <h1>My Bookmarks</h1>
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
      background: #f8f9fa;
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .top-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;

      h1 {
        font-size: 2rem;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0;
        letter-spacing: -0.5px;
      }
    }

    .bookmarks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .bookmark-collection {
      cursor: pointer;
      
      &:hover {
        .collection-preview {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.08);
        }
      }
    }

    .collection-preview {
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      border: 1px solid rgba(0, 0, 0, 0.05);

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
        padding: 1rem;
        border-top: 1px solid #f0f0f0;

        h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        span {
          font-size: 0.8rem;
          color: #666;
        }
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: #666;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);

      mat-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        margin-bottom: 1.5rem;
        color: #2563eb;
      }

      p {
        font-size: 1.5rem;
        font-weight: 500;
        margin: 0 0 0.5rem 0;
        color: #1a1a1a;
      }

      span {
        font-size: 1rem;
      }
    }

    .loading-state {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }

    .dialog-container {
      padding: 1.5rem;
      min-width: 600px;
      max-width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #f0f0f0;

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #1a1a1a;
      }
    }

    .books-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1.5rem;
    }
    
    @media (max-width: 768px) {
      .main-content {
        padding: 1rem;
      }
      
      .top-row h1 {
        font-size: 1.5rem;
      }
      
      .bookmarks-grid {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem;
      }
      
      .dialog-container {
        min-width: auto;
        width: 100%;
      }
      
      .books-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 1rem;
      }
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