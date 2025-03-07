import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth/services/auth.service';
import { BookService } from '../books/services/book.service';
import { ChapterService } from '../books/services/chapter.service';
import { SidebarComponent } from '../shared/components/sidebar/sidebar.component';
import { SearchBarComponent } from '../shared/components/search-bar/search-bar.component';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

interface PopularBook {
  id: number;
  title: string;
  coverImage: string;
  totalEngagement: number; // comments + views + reactions
  commentsCount: number;
  viewsCount: number;
}

interface ReaderActivity {
  userFullName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  chapterTitle: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    SidebarComponent,
    SearchBarComponent
  ],
  template: `
    <div class="app-container">
      <app-sidebar></app-sidebar>

      <div class="main-content">
        <app-search-bar></app-search-bar>

        <div class="current-book" *ngIf="currentBook">
          <div class="book-info">
            <h1>Happy reading, {{ currentUserName }}</h1>
            <p>{{ currentBook.description || 'Discover our most engaging book!' }}</p>
            <p>{{ currentBook.commentsCount || 0 }} readers have shared their thoughts. Join the discussion!</p>
            <button (click)="startReading()">Start reading →</button>
          </div>
          <div class="book-preview">
            <img [src]="currentBook.coverImage" 
                 [alt]="currentBook.title"
                 (error)="onImageError($event)">
          </div>
        </div>

        <div class="content-grid">
          <div class="left-column">
            <div class="section">
              <div class="section-header">
                <h2>Popular Now</h2>
              </div>
              <div class="book-grid">
                <div class="book-card" *ngFor="let book of popularBooks" 
                     (click)="navigateToBook(book.id)">
                  <img [src]="book.coverImage" 
                       [alt]="book.title"
                       (error)="onImageError($event)">
                  <p class="book-title">{{ book.title }}</p>
                  <div class="engagement-stats">
                    <span><mat-icon>visibility</mat-icon> {{ book.viewsCount }}</span>
                    <span><mat-icon>comment</mat-icon> {{ book.commentsCount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="right-column">
            <div class="section">
              <div class="section-header">
                <h2>Reader Activities</h2>
              </div>
              <div class="friends-list">
                <div class="friend" *ngFor="let activity of readerActivities">
                  <img [src]="activity.userAvatar" [alt]="activity.userFullName">
                  <div class="friend-info">
                    <p class="friend-name">{{ activity.userFullName }}</p>
                    <p class="friend-status">{{ activity.content }}</p>
                    <p class="chapter-info">
                      ← {{ activity.chapterTitle }}
                      <span class="time">{{ activity.createdAt | date:'MMM d' }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      display: grid;
      grid-template-columns: auto 1fr;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .main-content {
      display: flex;
      padding: 32px;
      flex-direction: column;
      gap: 32px;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .current-book {
      background: white;
      border-radius: 12px;
      padding: 40px;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 40px;
      margin-bottom: 32px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #eee;

      .book-info {
        max-width: 520px;

        h1 {
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1a1a1a;
        }

        p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 12px;
          font-size: 16px;
        }

        button {
          background: #2563eb;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          margin-top: 24px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: #1d4ed8;
          }
        }
      }

      .book-preview img {
        width: 280px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease;

        &:hover {
          transform: translateY(-4px);
        }
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 32px;

      .section {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #eee;
      }
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h2 {
        font-size: 18px;
        font-weight: 600;
        color: #1a1a1a;
      }

      .more-btn {
        color: #666;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: background-color 0.2s ease;

        &:hover {
          background-color: #f5f5f5;
        }
      }
    }

    .book-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;

      .book-card {
        transition: transform 0.2s ease;
        cursor: pointer;

        &:hover {
          transform: translateY(-4px);
        }

        img {
          width: 100%;
          aspect-ratio: 3/4;
          object-fit: cover;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .book-title {
          font-size: 14px;
          color: #333;
          margin-top: 12px;
          font-weight: 500;
        }
      }
    }

    .calendar {
      margin-top: 20px;

      .calendar-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        margin-bottom: 16px;

        span {
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }
      }

      .calendar-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
        text-align: center;

        .day {
          font-size: 14px;
          color: #333;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: #f5f5f5;
          }

          &.active {
            background: #2563eb;
            color: white;
          }
        }
      }
    }

    .friends-list {
      margin-top: 20px;

      .friend {
        display: flex;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        transition: background-color 0.2s ease;
        margin-bottom: 12px;

        &:hover {
          background-color: #f5f5f5;
        }

        img {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: cover;
        }

        .friend-info {
          flex: 1;

          .friend-name {
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 4px;
            color: #1a1a1a;
          }

          .friend-status {
            font-size: 13px;
            line-height: 1.5;
            color: #666;
            margin-bottom: 4px;
          }

          .chapter-info {
            font-size: 12px;
            color: #2563eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 500;

            .time {
              color: #666;
            }
          }
        }
      }
    }

    .search-bar {
      display: flex;
      align-items: center;
      background: white;
      padding: 12px 20px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);

      input {
        flex: 1;
        border: none;
        margin: 0 15px;
        font-size: 16px;
        &:focus {
          outline: none;
        }
      }

      .user-profile {
        display: flex;
        align-items: center;
        gap: 15px;

        img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
      }
    }

    @media (max-width: 1400px) {
      .main-content {
        padding: 32px;
      }

      .current-book {
        padding: 40px;
        gap: 40px;
      }
    }

    @media (max-width: 992px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .current-book {
        grid-template-columns: 1fr;
        text-align: center;
        padding: 32px;

        .book-info {
          margin: 0 auto;
        }

        .book-preview img {
          width: 280px;
          margin: 0 auto;
        }
      }

      .book-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .engagement-stats {
      display: flex;
      gap: 12px;
      margin-top: 8px;
      color: #666;
      font-size: 12px;

      span {
        display: flex;
        align-items: center;
        gap: 4px;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }

    .loading-state {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  popularBooks: PopularBook[] = [];
  currentBook: any = null;
  readerActivities: ReaderActivity[] = [];
  loading = true;
  currentUserName = '';
  private readonly DEFAULT_BOOK_COVER = 'assets/images/default-book-cover.jpg';

  constructor(
    private router: Router,
    private bookService: BookService,
    private chapterService: ChapterService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get current user info
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.currentUserName = user.fullName || 'Reader';
        }
      }
    });

    // Load popular books and activities
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.loading = true;
    this.bookService.getPublicBooks(0, 10, '', '').subscribe({
      next: (response) => {
        if (response.content && response.content.length > 0) {
          // Process books to calculate engagement
          const processedBooks = response.content.map(book => ({
            id: book.id,
            title: book.title,
            coverImage: this.bookService.getBookCoverUrl(book.coverImage),
            description: book.description,
            totalEngagement: this.calculateEngagement(book),
            commentsCount: book.commentsCount || 0,
            viewsCount: book.views || 0
          }));

          // Sort by total engagement and take top 4
          this.popularBooks = processedBooks
            .sort((a: PopularBook, b: PopularBook) => b.totalEngagement - a.totalEngagement)
            .slice(0, 4);

          // Set current book as the most popular one
          this.currentBook = this.popularBooks[0];

          // Load reader activities for the most popular book
          if (this.currentBook) {
            this.loadReaderActivities(this.currentBook.id);
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  private calculateEngagement(book: any): number {
    return (book.commentsCount || 0) + 
           (book.views || 0) + 
           (book.reactions?.like || 0);
  }

  private loadReaderActivities(bookId: number) {
    // Load both book comments and first chapter comments
    forkJoin({
      bookComments: this.bookService.getBookComments(bookId),
      chapters: this.bookService.getChapters(bookId) // Fixed method name
    }).subscribe({
      next: ({ bookComments, chapters }) => {
        if (chapters.content && chapters.content.length > 0) { // Access content property
          // Get comments for the first chapter
          this.chapterService.getChapterComments(chapters.content[0].id).subscribe({
            next: (chapterComments) => {
              // Combine and format all activities
              const activities = [
                ...this.formatComments(bookComments, 'Book'),
                ...this.formatComments(chapterComments, chapters.content[0].title)
              ];

              // Sort by date and take latest 5
              this.readerActivities = activities
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5);
            }
          });
        }
      }
    });
  }

  private formatComments(comments: any[], contextTitle: string): ReaderActivity[] {
    return comments.map(comment => ({
      userFullName: comment.userFullName,
      userAvatar: comment.userAvatar || 'assets/images/default-avatar.png',
      content: comment.content,
      createdAt: comment.createdAt,
      chapterTitle: contextTitle
    }));
  }

  startReading() {
    if (this.currentBook) {
      this.router.navigate(['/books/public', this.currentBook.id]);
    }
  }

  navigateToBook(bookId: number) {
    this.router.navigate(['/books/public', bookId]);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.DEFAULT_BOOK_COVER;
  }
}