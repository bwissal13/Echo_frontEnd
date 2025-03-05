import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChapterService } from '../../services/chapter.service';
import { Chapter } from '../../models/book.interface';

@Component({
  selector: 'app-trash-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="trash-dialog">
      <div class="dialog-header">
        <mat-icon>delete_outline</mat-icon>
        <h2 mat-dialog-title>Trash</h2>
      </div>
      
      <mat-dialog-content>
        <div *ngIf="loading" class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!loading && trashedChapters.length === 0" class="empty-state">
          <mat-icon>delete_outline</mat-icon>
          <p>No items in trash</p>
        </div>

        <div *ngIf="!loading && trashedChapters.length > 0" class="chapters-list">
          <div *ngFor="let chapter of trashedChapters" class="chapter-item">
            <div class="chapter-info">
              <h4>{{ chapter.title || 'Untitled Chapter' }}</h4>
              <p class="deleted-date">Deleted {{ chapter.deletedAt ? (chapter.deletedAt | date) : 'recently' }}</p>
            </div>
            <div class="chapter-actions">
              <button mat-button (click)="restoreChapter(chapter)">
                <mat-icon>restore</mat-icon>
                Restore
              </button>
              <button mat-button color="warn" (click)="deleteChapterPermanently(chapter)">
                <mat-icon>delete_forever</mat-icon>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close()">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .trash-dialog {
      padding: 24px;
      min-width: 500px;
    }
    
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      
      .mat-icon {
        color: #666;
      }
      
      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
    }
    
    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 0;
      color: #666;
      
      .mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }
    }
    
    .chapters-list {
      .chapter-item {
        padding: 16px;
        border-bottom: 1px solid #eee;
        
        &:last-child {
          border-bottom: none;
        }
        
        .chapter-info {
          h4 {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
          }
          
          .deleted-date {
            color: #666;
            font-size: 14px;
            margin: 4px 0;
          }
        }
        
        .chapter-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
      }
    }
  `]
})
export class TrashDialogComponent implements OnInit {
  trashedChapters: Chapter[] = [];
  loading = true;

  constructor(
    public dialogRef: MatDialogRef<TrashDialogComponent>,
    private chapterService: ChapterService
  ) {}

  ngOnInit() {
    this.loadTrashedChapters();
  }

  loadTrashedChapters() {
    this.loading = true;
    this.chapterService.getTrashChapters().subscribe({
      next: (response) => {
        this.trashedChapters = response.content;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trashed chapters:', error);
        this.loading = false;
      }
    });
  }

  restoreChapter(chapter: Chapter) {
    this.chapterService.restoreFromTrash(chapter.id).subscribe({
      next: () => {
        this.trashedChapters = this.trashedChapters.filter(c => c.id !== chapter.id);
        // Optionally notify parent component about the restore
        this.dialogRef.close({ action: 'restore', chapterId: chapter.id });
      },
      error: (error) => {
        console.error('Error restoring chapter:', error);
      }
    });
  }

  deleteChapterPermanently(chapter: Chapter) {
    this.chapterService.permanentDelete(chapter.id).subscribe({
      next: () => {
        this.trashedChapters = this.trashedChapters.filter(c => c.id !== chapter.id);
      },
      error: (error) => {
        console.error('Error deleting chapter permanently:', error);
      }
    });
  }
} 