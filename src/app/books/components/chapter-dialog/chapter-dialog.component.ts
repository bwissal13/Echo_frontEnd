import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { QuillModule, QuillModules } from 'ngx-quill';
import { quillConfig } from '../../config/quill-config';
import { BookService } from '../../services/book.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-chapter-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    QuillModule
  ],
  template: `
    <div class="notion-container">
      <div class="top-bar">
        <div class="left-actions">
          <button mat-icon-button (click)="onCancel()" class="back-button">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="page-info">
            <div class="breadcrumb">My Books / {{ data.title || 'Untitled' }}</div>
            <div class="last-edited">Last edited {{ lastEdited | date:'shortTime' }}</div>
          </div>
        </div>
        <div class="right-actions">
          <button mat-button class="share-button">
            <mat-icon>share</mat-icon>
            Share
          </button>
          <button mat-button [matMenuTriggerFor]="moreMenu">
            <mat-icon>more_horiz</mat-icon>
          </button>
          <mat-menu #moreMenu="matMenu">
            <button mat-menu-item (click)="onSave()">
              <mat-icon>save</mat-icon>
              Save
            </button>
          </mat-menu>
        </div>
      </div>

      <div class="content-area">
        <div class="cover-section" [style.background-image]="coverImageUrl">
          <input #fileInput type="file" hidden (change)="onCoverImageSelected($event)" accept="image/*">
          <button mat-icon-button class="change-cover" (click)="fileInput.click()">
            <mat-icon>add_photo_alternate</mat-icon>
          </button>
        </div>

        <div class="title-section">
          <input 
            class="title-input" 
            [(ngModel)]="data.title" 
            placeholder="Untitled"
          >
        </div>

        <div class="description-section">
          <quill-editor
            [(ngModel)]="data.content"
            [modules]="quillModules"
            [placeholder]="''"
            class="editor-style">
          </quill-editor>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notion-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      overflow-x: hidden;
    }

    .top-bar {
      height: 45px;
      padding: 0 12px;
      border-bottom: 1px solid #efefef;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      position: sticky;
      top: 0;
      z-index: 100;

      .left-actions {
        display: flex;
        align-items: center;
        gap: 12px;

        .page-info {
          .breadcrumb {
            font-size: 12px;
            color: #6B7280;
          }
          .last-edited {
            font-size: 11px;
            color: #9CA3AF;
          }
        }
      }

      .right-actions {
        display: flex;
        align-items: center;
        gap: 8px;

        .share-button {
          background: #F3F4F6;
          color: #374151;
          &:hover {
            background: #E5E7EB;
          }
        }
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        line-height: 20px;
      }

      .back-button {
        width: 28px;
        height: 28px;
        line-height: 28px;
      }
    }

    .content-area {
      flex: 1;
      max-width: 900px;
      width: 100%;
      margin: 0 auto;
      padding: 0 96px;
      overflow-y: auto;
    }

    .cover-section {
      height: 320px;
      width: 100%;
      background-color: #F9FAFB;
      background-size: cover;
      background-position: center;
      position: relative;
      margin-bottom: 64px;
      border-radius: 0 0 12px 12px;
      transition: height 0.3s ease;

      .change-cover {
        position: absolute;
        bottom: 16px;
        right: 16px;
        background: rgba(255, 255, 255, 0.9);
        opacity: 0;
        &:hover {
          background: white;
        }
        width: 32px;
        height: 32px;
        line-height: 32px;
        
        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      &:hover {
        .change-cover {
          opacity: 1;
        }
      }
    }

    .title-section {
      margin: 96px 0 0;
      
      .title-input {
        width: 100%;
        font-size: 2.5em;
        font-weight: 700;
        border: none;
        outline: none;
        padding: 12px 0;
        color: rgb(55, 53, 47);
        background: transparent;
        caret-color: rgb(55, 53, 47);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        letter-spacing: -0.02em;

        &::placeholder {
          color: rgba(55, 53, 47, 0.4);
        }

        &:focus {
          background: transparent;
        }
      }
    }

    .description-section {
      margin: 4px 0 24px;

      ::ng-deep {
        .ql-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 1.2em;
          border: none;
          
          .ql-editor {
            padding: 0;
            color: rgb(55, 53, 47);
            line-height: 1.75;
            font-size: 1.2em;
            cursor: text;
            min-height: calc(100vh - 480px);

            p {
              margin: 4px 0;
              padding: 3px 2px;
              min-height: 1.75em;
            }

            &.ql-blank::before {
              color: rgba(55, 53, 47, 0.4);
              font-style: normal;
              left: 2px;
              font-size: 1.2em;
              transition: color 0.2s ease;
            }
          }
        }

        // Hide all toolbar elements
        .ql-toolbar, .ql-tooltip {
          display: none !important;
        }
      }
    }

    .editor-style {
      .ql-container {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 1.2em;
        border: none;
        border-top: 1px solid #eee;
        
        .ql-editor {
          padding: 20px 0;
          color: rgb(55, 53, 47);
          line-height: 1.75;
          min-height: calc(100vh - 480px);

          p {
            margin: 4px 0;
            padding: 3px 2px;
            min-height: 1.75em;
          }
        }
      }

      .ql-toolbar {
        border: none;
        border-bottom: 1px solid #eee;
        padding: 8px 0;
      }
    }
  `]
})
export class ChapterDialogComponent {
  quillModules: QuillModules = quillConfig.modules as QuillModules;
  lastEdited = new Date();
  coverImageUrl: string = '';

  constructor(
    public dialogRef: MatDialogRef<ChapterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private bookService: BookService,
    private snackBar: MatSnackBar
  ) {
    if (this.data.coverImage) {
      this.coverImageUrl = `url("${this.data.coverImage}")`;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.data.title && this.data.content) {
      this.dialogRef.close(this.data);
    }
  }

  onCoverImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        this.bookService.uploadCoverImage(file).subscribe({
          next: (response) => {
            this.data.coverImage = response.url;
            this.coverImageUrl = `url('${this.data.coverImage}')`;
            this.showSuccessMessage('Cover image added successfully');
          },
          error: (error) => {
            console.error('Error processing image:', error);
            this.showErrorMessage('Failed to process image');
          }
        });
      } else {
        this.showErrorMessage('Please select an image file');
      }
    }
  }

  showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }
} 