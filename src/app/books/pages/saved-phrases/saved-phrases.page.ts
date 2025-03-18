import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../../auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface SavedSelection {
  text: string;
  startOffset: number;
  endOffset: number;
  chapterId: number;
  bookId: number;
  savedAt: string;
  note?: string;
  userId?: string;
}

@Component({
  selector: 'app-saved-phrases',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    SidebarComponent
  ],
  template: `
    <div class="app-container">
      <app-sidebar></app-sidebar>
      
      <div class="main-content">
        <div class="saved-phrases-container">
          <div class="header">
            <h1>Saved Phrases</h1>
          </div>

          <div class="phrases-list" *ngIf="savedPhrases.length > 0">
            <div class="phrase-card" *ngFor="let phrase of savedPhrases">
              <div class="phrase-content">
                <div class="quote">"{{ phrase.text }}"</div>
                <div class="metadata">
                  <span class="date">{{ phrase.savedAt | date:'MMM d, y' }}</span>
                  <button mat-button color="primary" [routerLink]="['/books/chapter', phrase.chapterId]">
                    Go to Chapter
                    <mat-icon>chevron_right</mat-icon>
                  </button>
                </div>
              </div>
              <div class="actions">
                <button mat-icon-button (click)="deleteSavedPhrase(phrase)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="savedPhrases.length === 0">
            <mat-icon>bookmark_border</mat-icon>
            <h2>No saved phrases yet</h2>
            <p>Select text while reading to save your favorite phrases</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .main-content {
      flex: 1;
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .saved-phrases-container {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      border: 1px solid #eee;

      .header {
        margin-bottom: 32px;
        border-bottom: 1px solid #eee;
        padding-bottom: 24px;

        h1 {
          font-size: 32px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }
      }
    }

    .phrases-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .phrase-card {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        border-color: #ddd;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }

      .phrase-content {
        flex: 1;
        margin-right: 16px;

        .quote {
          font-size: 16px;
          color: #1a1a1a;
          line-height: 1.6;
          margin-bottom: 12px;
          font-style: italic;
        }

        .metadata {
          display: flex;
          align-items: center;
          gap: 16px;
          color: #666;
          font-size: 14px;

          button {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }

      .actions {
        button {
          color: #666;

          &:hover {
            color: #dc3545;
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 48px 0;
      color: #666;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }

      h2 {
        font-size: 20px;
        font-weight: 500;
        margin-bottom: 8px;
      }

      p {
        font-size: 16px;
        margin: 0;
      }
    }
  `]
})
export class SavedPhrasesPage implements OnInit {
  savedPhrases: SavedSelection[] = [];
  private currentUserId: string | null = null;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentUserId();
    
    // Migrate existing phrases to include user IDs if needed
    this.migrateExistingPhrases();
    
    this.loadSavedPhrases();
  }

  // This method adds user IDs to existing phrases
  private migrateExistingPhrases() {
    // Only proceed if we have a valid user ID
    if (!this.currentUserId) return;
    
    const saved = localStorage.getItem('savedSelections');
    if (saved) {
      const allPhrases: SavedSelection[] = JSON.parse(saved);
      let hasChanges = false;
      
      // Find phrases without userIds and assign them to the current user
      allPhrases.forEach(phrase => {
        if (!phrase.userId) {
          // Use currentUserId only if it's not null (we already checked above)
          phrase.userId = this.currentUserId as string;
          hasChanges = true;
        }
      });
      
      // Save back if we made changes
      if (hasChanges) {
        localStorage.setItem('savedSelections', JSON.stringify(allPhrases));
        this.snackBar.open('Your saved phrases have been updated', 'Close', {
          duration: 3000
        });
      }
    }
  }

  loadSavedPhrases() {
    if (!this.currentUserId) {
      this.savedPhrases = [];
      return;
    }
    
    const saved = localStorage.getItem('savedSelections');
    if (saved) {
      const allPhrases: SavedSelection[] = JSON.parse(saved);
      
      // Only show phrases that explicitly belong to this user
      this.savedPhrases = allPhrases.filter(phrase => 
        phrase.userId === this.currentUserId
      );
      
      // Sort by most recent first
      this.savedPhrases.sort((a, b) => 
        new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      );
    }
  }

  deleteSavedPhrase(phrase: SavedSelection) {
    if (!this.currentUserId) return;
    
    const saved = localStorage.getItem('savedSelections');
    if (saved) {
      const allPhrases: SavedSelection[] = JSON.parse(saved);
      
      // Only delete if it belongs to the current user
      const index = allPhrases.findIndex(p => 
        p.text === phrase.text && 
        p.bookId === phrase.bookId && 
        p.chapterId === phrase.chapterId &&
        p.savedAt === phrase.savedAt &&
        p.userId === this.currentUserId
      );
      
      if (index > -1) {
        allPhrases.splice(index, 1);
        localStorage.setItem('savedSelections', JSON.stringify(allPhrases));
        
        const localIndex = this.savedPhrases.indexOf(phrase);
        if (localIndex > -1) {
          this.savedPhrases.splice(localIndex, 1);
        }
      }
    }
  }
} 