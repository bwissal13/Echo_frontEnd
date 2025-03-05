import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Chapter } from '../../models/book.interface';

@Component({
  selector: 'app-chapter-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="chapter-editor">
      <div class="editor-header">
        <div class="left-actions">
          <button mat-icon-button (click)="onCancel()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-info">
            <div class="breadcrumb">Chapter {{ chapter.order }}</div>
            <div class="last-edited">Last edited {{ lastEdited | date:'shortTime' }}</div>
          </div>
        </div>
        <div class="right-actions">
          <button mat-button (click)="onSave()">
            <mat-icon>save</mat-icon>
            Save changes
          </button>
        </div>
      </div>

      <div class="editor-content">
        <div class="title-section">
          <input 
            [(ngModel)]="chapter.title"
            class="title-input" 
            placeholder="Chapter Title"
            required
          >
        </div>

        <div class="content-section">
          <textarea
            [(ngModel)]="chapter.content"
            class="content-textarea"
            placeholder="Write your chapter content here..."
            rows="20">
          </textarea>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./chapter-editor.component.scss']
})
export class ChapterEditorComponent {
  chapter: Chapter;
  isEditing: boolean;
  lastEdited: Date;

  constructor(
    public dialogRef: MatDialogRef<ChapterEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { chapter: Chapter; isEditing: boolean }
  ) {
    this.chapter = { ...data.chapter };
    this.isEditing = data.isEditing;
    this.lastEdited = this.chapter.updatedAt || new Date();
  }

  onSave(): void {
    if (this.chapter.title.trim()) {
      this.chapter.updatedAt = new Date();
      this.dialogRef.close(this.chapter);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 