import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookCardComponent } from '../../../shared/components/book-card/book-card.component';

@Component({
  selector: 'app-recent-books',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, BookCardComponent],
  template: `
    <div class="recent-books-container">
      <div class="header">
        <h2>Recently Viewed Books</h2>
      </div>

      <div class="empty-state">
        <mat-icon>history</mat-icon>
        <p>No recently viewed books</p>
      </div>
    </div>
  `,
  styles: [`
    .recent-books-container {
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
  `]
})
export class RecentBooksComponent {
  // Component logic will be added later
} 