import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { Book, Genre } from '../../../books/models/book.interface';
import { BookmarkService } from '../../services/bookmark.service';
import { AddToBookmarkDialogComponent } from '../add-to-bookmark-dialog/add-to-bookmark-dialog.component';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule, 
    RouterModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss']
})
export class BookCardComponent {
  @Input() book!: Book;
  @Input() imageUrl!: string;
  @Output() selectBook = new EventEmitter<Event>();

  constructor(
    private bookmarkService: BookmarkService,
    private dialog: MatDialog
  ) {}

  formatGenre(genre: Genre): string {
    return genre?.toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || 'Uncategorized';
  }

  onSelect(event: Event): void {
    this.selectBook.emit(event);
  }

  openBookmarkDialog(event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(AddToBookmarkDialogComponent, {
      width: '400px',
      data: { book: this.book }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle bookmark added
      }
    });
  }

  isBookmarked(): boolean {
    return this.bookmarkService.isBookmarked(this.book.id);
  }
} 