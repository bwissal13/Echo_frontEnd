import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Book } from '../../../books/models/book.interface';
import { BookmarkService, BookmarkGroup } from '../../services/bookmark.service';

@Component({
  selector: 'app-add-to-bookmark-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <h2 mat-dialog-title>Add to Bookmark</h2>
    <mat-dialog-content>
      <div class="bookmark-form">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Select Group</mat-label>
          <mat-select [(ngModel)]="selectedGroupId">
            <mat-option [value]="null">Create New Group</mat-option>
            <mat-option *ngFor="let group of (groups || [])" [value]="group.id">
              {{group.name}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field *ngIf="!selectedGroupId" appearance="fill" class="full-width">
          <mat-label>New Group Name</mat-label>
          <input matInput [(ngModel)]="newGroupName" placeholder="Enter group name">
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!isValid()">
        Save
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .bookmark-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 300px;
      padding: 16px 0;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class AddToBookmarkDialogComponent {
  groups: BookmarkGroup[] = [];
  selectedGroupId: number | null = null;
  newGroupName: string = '';
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<AddToBookmarkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { book: Book },
    private bookmarkService: BookmarkService,
    private snackBar: MatSnackBar
  ) {
    this.loadGroups();
  }

  loadGroups() {
    this.loading = true;
    this.bookmarkService.getBookmarkGroups().subscribe({
      next: (groups) => {
        this.groups = groups;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open(error, 'Close', {
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  isValid(): boolean {
    if (this.selectedGroupId !== null) {
      return true;
    }
    return Boolean(this.newGroupName?.trim().length > 0);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.isValid()) return;

    this.loading = true;
    if (this.selectedGroupId) {
      this.addToExistingGroup();
    } else if (this.newGroupName) {
      this.createNewGroupAndAdd();
    }
  }

  private addToExistingGroup() {
    this.bookmarkService.addToBookmark({
      bookId: this.data.book.id,
      groupId: this.selectedGroupId!
    }).subscribe({
      next: () => {
        this.snackBar.open('Book added to bookmark', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.snackBar.open(error, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  private createNewGroupAndAdd() {
    this.bookmarkService.createBookmarkGroup({ 
      name: this.newGroupName.trim() 
    }).subscribe({
      next: (newGroup) => {
        this.bookmarkService.addToBookmark({
          bookId: this.data.book.id,
          groupId: newGroup.id
        }).subscribe({
          next: () => {
            this.snackBar.open('Book added to new bookmark group', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            this.snackBar.open(error, 'Close', { duration: 3000 });
            this.loading = false;
          }
        });
      },
      error: (error) => {
        this.snackBar.open(error, 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
} 