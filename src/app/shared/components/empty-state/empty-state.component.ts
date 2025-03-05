import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterModule],
  template: `
    <div class="empty-state">
      <mat-icon>library_books</mat-icon>
      <h3>No books yet</h3>
      <p>Start writing your first book!</p>
      <button mat-raised-button color="primary" routerLink="/books/new" *ngIf="isAuthor">
        <mat-icon>add</mat-icon>
        New Book
      </button>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() isAuthor = false;
} 