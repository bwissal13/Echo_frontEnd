import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <div class="book-container">
      <!-- Left Sidebar -->
      <aside class="sidebar">
        <div class="menu-items">
          <a class="menu-item active">
            <mat-icon>home</mat-icon>
            <span>Home</span>
          </a>
          <a class="menu-item">
            <mat-icon>library_books</mat-icon>
            <span>My Books</span>
          </a>
          <a class="menu-item">
            <mat-icon>history</mat-icon>
            <span>Recent</span>
          </a>
          <a class="menu-item">
            <mat-icon>bookmark</mat-icon>
            <span>Bookmarks</span>
          </a>
          <a class="menu-item">
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </a>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <div class="flex justify-between items-center mb-6">
          <div class="search-bar flex-1 mr-4">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Search book name, author, edition...">
            <div class="user-profile">
              <img [src]="userAvatar" alt="User">
              <mat-icon>notifications</mat-icon>
            </div>
          </div>
          <button mat-raised-button color="primary" routerLink="/books/new">
            <mat-icon>add</mat-icon>
            New Book
          </button>
        </div>

        <div class="book-grid">
          <mat-card *ngFor="let book of books" class="book-card">
            <img [src]="book.coverImage" [alt]="book.title">
            <div class="book-info">
              <h3>{{book.title}}</h3>
              <p>{{book.author}}</p>
              <div class="book-actions">
                <button mat-icon-button>
                  <mat-icon>bookmark</mat-icon>
                </button>
                <button mat-icon-button>
                  <mat-icon>share</mat-icon>
                </button>
                <button mat-icon-button [routerLink]="['/books/edit', book.id]">
                  <mat-icon>edit</mat-icon>
                </button>
              </div>
            </div>
          </mat-card>
        </div>
      </main>
    </div>
  `,
  styleUrls: ['./book-list.component.scss']
})
export class BookListComponent implements OnInit {
  books: any[] = [];
  userAvatar = 'assets/default-avatar.png';

  ngOnInit() {
    // Charger les livres
  }
} 