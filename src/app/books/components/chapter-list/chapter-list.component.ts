import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Chapter } from '../../models/book.interface';

@Component({
  selector: 'app-chapter-list',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule, DragDropModule],
  template: `
    <mat-list cdkDropList (cdkDropListDropped)="drop($event)">
      <div *ngFor="let chapter of chapters" cdkDrag class="chapter-item">
        <mat-list-item>
          <mat-icon cdkDragHandle>drag_indicator</mat-icon>
          <span class="chapter-title">{{ chapter.title }}</span>
          <div class="chapter-actions">
            <button mat-icon-button (click)="editChapter.emit(chapter)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button (click)="deleteChapter.emit(chapter)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </mat-list-item>
      </div>
    </mat-list>
  `,
  styles: [`
    .chapter-item {
      display: flex;
      align-items: center;
      padding: 8px;
      border-bottom: 1px solid #eee;
      cursor: move;
    }

    .chapter-title {
      flex: 1;
      margin: 0 16px;
    }

    .chapter-actions {
      display: flex;
      gap: 8px;
    }

    .cdk-drag-preview {
      box-shadow: 0 5px 5px -3px rgba(0,0,0,0.2),
                  0 8px 10px 1px rgba(0,0,0,0.14),
                  0 3px 14px 2px rgba(0,0,0,0.12);
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class ChapterListComponent {
  @Input() chapters: Chapter[] = [];
  @Output() chaptersReordered = new EventEmitter<Chapter[]>();
  @Output() editChapter = new EventEmitter<Chapter>();
  @Output() deleteChapter = new EventEmitter<Chapter>();

  drop(event: CdkDragDrop<Chapter[]>) {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.chapters, event.previousIndex, event.currentIndex);
      this.chaptersReordered.emit(this.chapters);
    }
  }
} 