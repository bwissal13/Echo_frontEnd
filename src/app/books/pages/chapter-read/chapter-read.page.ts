import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { BookService } from '../../services/book.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-chapter-read',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    SidebarComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  template: `
    <div class="app-container">
      <app-sidebar></app-sidebar>
      
      <div class="main-content">
        <app-loading-spinner *ngIf="loading"></app-loading-spinner>
        <app-error-message *ngIf="error" [message]="error"></app-error-message>

        <div class="chapter-container" *ngIf="chapter && !loading">
          <div class="chapter-header">
            <div class="navigation">
              <button mat-button *ngIf="prevChapterId" (click)="navigateToChapter(prevChapterId)">
                <mat-icon>chevron_left</mat-icon>
                Previous Chapter
              </button>
              <button mat-button (click)="backToBook()">
                <mat-icon>menu_book</mat-icon>
                Back to Book
              </button>
              <button mat-button *ngIf="nextChapterId" (click)="navigateToChapter(nextChapterId)">
                Next Chapter
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>

            <h1>{{ chapter.title }}</h1>
            
            <div class="chapter-actions">
              <button mat-icon-button [class.active]="hasReacted('like')" (click)="toggleReaction('like')">
                <mat-icon>favorite</mat-icon>
                <span>{{ chapter.reactions?.like || 0 }}</span>
              </button>
              <button mat-icon-button (click)="scrollToComments()">
                <mat-icon>comment</mat-icon>
                <span>{{ chapter.comments?.length || 0 }}</span>
              </button>
            </div>
          </div>

          <div class="chapter-content" [innerHTML]="chapter.content"></div>

          <div class="comments-section" #commentsSection>
            <h2>Comments</h2>
            
            <div class="comment-form" *ngIf="isAuthenticated">
              <mat-form-field appearance="outline">
                <textarea matInput 
                  [(ngModel)]="newComment" 
                  placeholder="Write a comment..."
                  rows="3"></textarea>
              </mat-form-field>
              <button mat-raised-button 
                color="primary" 
                [disabled]="!newComment.trim()"
                (click)="addComment()">
                Post Comment
              </button>
            </div>

            <div class="comments-list">
              <div class="comment-card" *ngFor="let comment of comments">
                <div class="comment-header">
                  <img [src]="comment.userAvatar" [alt]="comment.userFullName">
                  <div class="comment-info">
                    <span class="username">{{ comment.userFullName }}</span>
                    <span class="timestamp">{{ comment.createdAt | date:'medium' }}</span>
                  </div>
                </div>
                <p class="comment-content">{{ comment.content }}</p>
                <div class="comment-actions">
                  <button mat-button (click)="toggleReply(comment.id)">
                    Reply
                  </button>
                </div>

                <!-- Reply form -->
                <div class="reply-form" *ngIf="replyingTo === comment.id">
                  <mat-form-field appearance="outline">
                    <textarea matInput 
                      [(ngModel)]="replyContent" 
                      placeholder="Write a reply..."
                      rows="2"></textarea>
                  </mat-form-field>
                  <div class="reply-actions">
                    <button mat-button (click)="cancelReply()">Cancel</button>
                    <button mat-raised-button 
                      color="primary" 
                      [disabled]="!replyContent.trim()"
                      (click)="addReply(comment.id)">
                      Reply
                    </button>
                  </div>
                </div>

                <!-- Nested replies -->
                <div class="replies" *ngIf="comment.replies?.length">
                  <div class="reply-card" *ngFor="let reply of comment.replies">
                    <div class="comment-header">
                      <img [src]="reply.userAvatar" [alt]="reply.userFullName">
                      <div class="comment-info">
                        <span class="username">{{ reply.userFullName }}</span>
                        <span class="timestamp">{{ reply.createdAt | date:'medium' }}</span>
                      </div>
                    </div>
                    <p class="comment-content">{{ reply.content }}</p>
                  </div>
                </div>
              </div>
            </div>
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
      max-width: 800px;
      margin: 0 auto;
      width: 100%;
    }

    .chapter-container {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      border: 1px solid #eee;
    }

    .chapter-header {
      margin-bottom: 32px;
      border-bottom: 1px solid #eee;
      padding-bottom: 24px;
      
      .navigation {
        display: flex;
        justify-content: space-between;
        margin-bottom: 24px;
        gap: 12px;

        button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          background-color: #f8f9fa;
          color: #333;
          transition: all 0.2s;

          &:hover {
            background-color: #e9ecef;
          }

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }
      }

      h1 {
        font-size: 32px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 16px;
        text-align: center;
        line-height: 1.3;
      }
    }

    .chapter-content {
      font-family: 'Georgia', serif;
      font-size: 18px;
      line-height: 1.8;
      color: #333;
      margin-bottom: 48px;
      
      p {
        margin-bottom: 1.5em;
      }

      h2, h3, h4 {
        margin: 1.5em 0 0.8em;
        color: #1a1a1a;
      }
    }

    .chapter-actions {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #eee;

      button {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 8px;

        &.active {
          color: #2563eb;
        }

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }

        span {
          font-size: 14px;
          color: #666;
        }
      }
    }

    .comments-section {
      margin-top: 48px;
      border-top: 2px solid #eee;
      padding-top: 32px;

      h2 {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 24px;
        color: #1a1a1a;
      }
    }

    .comment-form {
      margin-bottom: 32px;

      mat-form-field {
        width: 100%;
        margin-bottom: 16px;
      }

      button {
        float: right;
      }
    }

    .comment-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      border: 1px solid #eee;

      .comment-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;

        img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .comment-info {
          .username {
            font-weight: 500;
            color: #1a1a1a;
            display: block;
          }

          .timestamp {
            font-size: 12px;
            color: #666;
          }
        }
      }

      .comment-content {
        font-size: 15px;
        line-height: 1.6;
        color: #333;
        margin-bottom: 12px;
      }
    }

    .reply-form {
      margin: 16px 0;
      padding-left: 52px;

      mat-form-field {
        width: 100%;
      }

      .reply-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 8px;
      }
    }

    .replies {
      margin-top: 16px;
      padding-left: 52px;

      .reply-card {
        background: white;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        border: 1px solid #eee;
      }
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 16px;
      }

      .chapter-container {
        padding: 20px;
        border-radius: 8px;
      }

      .chapter-header {
        .navigation {
          flex-wrap: wrap;
          
          button {
            flex: 1;
            min-width: 0;
            padding: 8px;
            
            span {
              display: none;
            }
          }
        }

        h1 {
          font-size: 24px;
        }
      }

      .chapter-content {
        font-size: 16px;
      }

      .replies {
        padding-left: 24px;
      }
    }
  `]
})
export class ChapterReadPage implements OnInit {
  chapter: any;
  loading = false;
  error = '';
  comments: Comment[] = [];
  newComment = '';
  isAuthenticated = false;
  replyingTo: number | null = null;
  replyContent = '';
  bookId: number | null = null;
  userReactions: Set<string> = new Set();
  currentUserAvatar = 'assets/images/default-avatar.png';
  currentUserName = 'Anonymous';
  prevChapterId: number | null = null;
  nextChapterId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    // Get user info if authenticated
    if (this.isAuthenticated) {
      this.authService.getCurrentUser().subscribe({
        next: (user) => {
          if (user) {
            this.currentUserAvatar = user.avatar || 'assets/images/default-avatar.png';
            this.currentUserName = user.fullName || 'Anonymous';
          }
        },
        error: (err) => {
          console.error('Error getting user data:', err);
        }
      });
    }

    // Load chapter and comments
    const chapterId = this.route.snapshot.paramMap.get('id');
    if (chapterId) {
      this.loadChapterInfo(+chapterId);
    }
  }

  loadChapterInfo(chapterId: number) {
    this.loading = true;
    this.error = '';

    this.bookService.getChapter(chapterId).subscribe({
      next: (response) => {
        this.chapter = response;
        this.bookId = response.bookId;
        this.setPrevNextChapters();
        this.loadComments(chapterId);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load chapter. Please try again.';
        this.loading = false;
        console.error('Error loading chapter:', err);
      }
    });
  }

  loadComments(chapterId: number) {
    this.bookService.getChapterComments(chapterId).subscribe({
      next: (response: Comment[]) => {
        this.comments = response.map(comment => ({
          ...comment,
          showReplies: false
        }));
      },
      error: (err) => {
        console.error('Failed to load comments:', err);
      }
    });
  }

  hasReacted(type: string): boolean {
    return this.userReactions.has(type);
  }

  navigateToChapter(chapterId: number) {
    this.router.navigate(['/books/chapter', chapterId]);
  }

  backToBook() {
    if (this.bookId) {
      this.router.navigate(['/books/public', this.bookId]);
    }
  }

  toggleReaction(type: string) {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.bookService.toggleChapterReaction(this.chapter.id, type).subscribe({
      next: (response: any) => {
        if (this.userReactions.has(type)) {
          this.userReactions.delete(type);
          this.chapter.reactions[type]--;
        } else {
          this.userReactions.add(type);
          this.chapter.reactions[type]++;
        }
      },
      error: (err: any) => {
        console.error('Failed to toggle reaction:', err);
      }
    });
  }

  private setPrevNextChapters() {
    if (this.chapter.chapters) {
      const currentIndex = this.chapter.chapters.findIndex((ch: any) => ch.id === this.chapter.id);
      this.prevChapterId = currentIndex > 0 ? this.chapter.chapters[currentIndex - 1].id : null;
      this.nextChapterId = currentIndex < this.chapter.chapters.length - 1 ? 
        this.chapter.chapters[currentIndex + 1].id : null;
    }
  }

  scrollToComments() {
    document.querySelector('.comments-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  addComment() {
    if (!this.newComment.trim() || !this.isAuthenticated || !this.chapter?.id) {
      return;
    }

    this.bookService.addComment(this.chapter.id, this.newComment).subscribe({
      next: (response: Comment) => {
        this.comments.unshift({
          ...response,
          showReplies: false
        });
        this.newComment = '';
      },
      error: (err) => {
        console.error('Failed to add comment:', err);
      }
    });
  }

  toggleReply(commentId: number) {
    this.replyingTo = this.replyingTo === commentId ? null : commentId;
    this.replyContent = '';
  }

  cancelReply() {
    this.replyingTo = null;
    this.replyContent = '';
  }

  addReply(commentId: number) {
    if (!this.replyContent.trim() || !this.isAuthenticated || !this.chapter?.id) {
      return;
    }

    this.bookService.addCommentReply(
      this.chapter.id,
      commentId,
      this.replyContent
    ).subscribe({
      next: (response: Comment) => {
        this.updateCommentsWithReply(commentId, {
          ...response,
          showReplies: false
        });
        this.cancelReply();
      },
      error: (err) => {
        console.error('Failed to add reply:', err);
      }
    });
  }

  private updateCommentsWithReply(commentId: number, reply: Comment) {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      if (!comment.replies) comment.replies = [];
      comment.replies.push(reply);
    }
  }

  likeComment(comment: Comment) {
    if (!this.isAuthenticated) return;

    this.bookService.toggleCommentLike(comment.id).subscribe({
      next: (response: { likesCount: number }) => {
        comment.isLiked = !comment.isLiked;
        comment.likesCount = response.likesCount;
      },
      error: (err) => {
        console.error('Failed to toggle like:', err);
      }
    });
  }
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userFullName: string;
  userAvatar: string;
  likesCount: number;
  isLiked: boolean;
  replies?: Comment[];
  showReplies?: boolean;
} 