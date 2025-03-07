import { Component, OnInit, HostListener } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';

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
    ErrorMessageComponent,
    MatTooltipModule
  ],
  template: `
    <div class="app-container">
      <app-sidebar></app-sidebar>
      
      <div class="main-content" [class.comments-open]="isCommentsPanelOpen">
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
            </div>
          </div>

          <div class="chapter-content" [innerHTML]="chapter.content"></div>
        </div>
      </div>

      <!-- Floating Comments Button -->
      <button mat-fab class="floating-comments-btn" (click)="toggleComments()">
        <mat-icon>comment</mat-icon>
        <span class="comment-count">{{ chapter?.comments?.length || 0 }}</span>
      </button>

      <!-- Comments Panel -->
      <div class="comments-panel" [class.open]="isCommentsPanelOpen">
        <div class="comments-header">
          <h2>Comments</h2>
          <button mat-icon-button (click)="toggleComments()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

       
        <div class="comments-content">
          <div class="comment-form" *ngIf="isAuthenticated">
            <div class="input-wrapper">
              <img [src]="currentUserAvatar" [alt]="currentUserName" class="user-avatar">
              <input type="text" 
                [(ngModel)]="newComment" 
                placeholder="Add a comment..."
                (keyup.enter)="addComment()">
              <button class="post-button" 
                [disabled]="!newComment.trim()"
                (click)="addComment()">
                Post
              </button>
            </div>
          </div>

          <div class="comments-list">
            <div class="comment-card" *ngFor="let comment of comments">
              <div class="comment-header">
                <div class="user-info">
                  <img [src]="comment.userAvatar" [alt]="comment.userFullName" class="user-avatar">
                  <div class="text-content">
                    <span class="username">{{ comment.userFullName }}</span>
                    <span class="comment-text">{{ comment.content }}</span>
                  </div>
                </div>
                <div class="comment-actions">
                  <button mat-icon-button (click)="likeComment(comment)" [class.liked]="comment.isLiked">
                    <mat-icon>favorite</mat-icon>
                  </button>
                </div>
              </div>

              <div class="comment-metadata">
                <span>{{ comment.createdAt | date:'MMM d' }}</span>
                <span>{{ comment.likesCount }} likes</span>
                <button mat-button (click)="toggleReply(comment.id)">Reply</button>
              </div>

              <!-- Reply form -->
              <div class="reply-form" *ngIf="replyingTo === comment.id">
                <div class="input-wrapper">
                  <input type="text" 
                    [(ngModel)]="replyContent" 
                    placeholder="Reply to {{ comment.userFullName }}..."
                    (keyup.enter)="addReply(comment.id)">
                  <button 
                    [disabled]="!replyContent.trim()"
                    (click)="addReply(comment.id)">
                    Post
                  </button>
                </div>
              </div>

              <!-- Replies -->
              <div class="replies" *ngIf="comment.replies?.length">
                <button mat-button class="view-replies" (click)="comment.showReplies = !comment.showReplies">
                  <mat-icon>{{ comment.showReplies ? 'expand_less' : 'expand_more' }}</mat-icon>
                  {{ comment.showReplies ? 'Hide' : 'View' }} {{ comment.replies?.length || 0 }} replies
                </button>

                <div class="replies-list" *ngIf="comment.showReplies">
                  <div class="reply-card" *ngFor="let reply of comment.replies">
                    <div class="user-info">
                      <img [src]="reply.userAvatar" [alt]="reply.userFullName" class="user-avatar">
                      <div class="text-content">
                        <span class="username">{{ reply.userFullName }}</span>
                        <span class="comment-text">{{ reply.content }}</span>
                      </div>
                    </div>
                    <div class="reply-metadata">
                      <span>{{ reply.createdAt | date:'MMM d' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selection Menu -->
      <div class="selection-menu" 
           *ngIf="showSelectionMenu"
           [style.top]="selectionMenuPosition.top"
           [style.left]="selectionMenuPosition.left">
        <div class="menu-content">
          <button mat-button class="menu-btn comment" (click)="addCommentToSelection()">
            <mat-icon>comment</mat-icon>
            <span>Comment</span>
          </button>
          <div class="divider"></div>
          <button mat-button class="menu-btn save" (click)="saveSelection()">
            <mat-icon>bookmark</mat-icon>
            <span>Save</span>
          </button>
        </div>
      </div>

      <!-- Success Snackbar -->
      <div class="snackbar" [class.show]="showSnackbar">
        <mat-icon>check_circle</mat-icon>
        <span>Phrase saved successfully!</span>
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
      transition: all 0.3s ease;

      &.comments-open {
        margin-right: 480px;
        max-width: calc(100% - 480px);
      }
    }

    .chapter-container {
      background: white;
      border-radius: 12px;
      padding: 48px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      border: 1px solid #eee;
      transition: all 0.3s ease;
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

    .floating-comments-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 100;
      background: #1a1a1a;
      color: white;

      &:hover {
        background: #333;
      }

      .comment-count {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #666;
        color: white;
        border-radius: 12px;
        padding: 2px 8px;
        font-size: 12px;
      }
    }

    .tab-navigation {
      display: flex;
      border-bottom: 1px solid #dee2e6;
      margin-bottom: 20px;
      padding: 0 24px;

      .tab-button {
        padding: 16px 0;
        margin-right: 32px;
        border: none;
        background: none;
        font-size: 16px;
        color: #6c757d;
        position: relative;
        cursor: pointer;

        &.active {
          color: #212529;
          font-weight: 500;

          &:after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background: #212529;
          }
        }
      }
    }

    .comments-panel {
      position: fixed;
      top: 0;
      right: -480px;
      width: 480px;
      height: 100vh;
      background: white;
      box-shadow: -2px 0 8px rgba(0,0,0,0.1);
      transition: right 0.3s ease;
      z-index: 1000;
      display: flex;
      flex-direction: column;

      &.open {
        right: 0;
      }
    }

    .comments-header {
      padding: 16px 24px;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
    }

    .comments-content {
      flex: 1;
      overflow-y: auto;
      padding: 0 24px;
    }

    .comment-form {
      padding: 16px 0;
      border-bottom: 1px solid #efefef;

      .input-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        input {
          flex: 1;
          border: none;
          background: none;
          padding: 12px 0;
          font-size: 14px;

          &:focus {
            outline: none;
          }

          &::placeholder {
            color: #8e8e8e;
          }
        }

        .post-button {
          color: #0095f6;
          font-weight: 600;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;

          &:disabled {
            opacity: 0.3;
          }
        }
      }
    }

    .comment-card {
      padding: 16px 0;
      border-bottom: 1px solid #efefef;

      .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .user-info {
          display: flex;
          gap: 12px;
          flex: 1;

          .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            object-fit: cover;
          }

          .text-content {
            .username {
              font-weight: 600;
              margin-right: 8px;
            }

            .comment-text {
              color: #262626;
            }
          }
        }

        .comment-actions {
          .liked {
            color: #ed4956;
          }
        }
      }

      .comment-metadata {
        margin-left: 44px;
        margin-top: 4px;
        font-size: 12px;
        color: #8e8e8e;

        > * {
          margin-right: 12px;
        }

        button {
          padding: 0;
          min-width: 0;
          font-weight: 600;
          font-size: 12px;
          color: #8e8e8e;
          text-transform: none;
        }
      }

      .replies {
        margin-left: 44px;
        margin-top: 8px;

        .view-replies {
          color: #8e8e8e;
          font-size: 12px;
          padding: 0;
          text-transform: none;
          
          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
            margin-right: 4px;
          }
        }

        .replies-list {
          margin-top: 8px;
        }
      }
    }

    .selection-menu {
      position: absolute;
      z-index: 1100;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transform: translate(-50%, -130%);
      animation: slideUp 0.2s ease;
      border: 1px solid #eee;
      overflow: hidden;

      .menu-content {
        display: flex;
        align-items: center;

        .menu-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: #666;
          transition: all 0.2s ease;
          border-radius: 0;
          min-width: 120px;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }

          span {
            font-weight: 500;
          }

          &:hover {
            background: #f8f9fa;
          }

          &.comment:hover {
            color: #1976d2;
          }

          &.save:hover {
            color: #4caf50;
          }
        }

        .divider {
          width: 1px;
          height: 24px;
          background: #eee;
        }
      }
    }

    .snackbar {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #4caf50;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 1200;

      &.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translate(-50%, -120%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -130%);
      }
    }

    .saved-phrase-wrapper {
      background-color: rgba(33, 150, 243, 0.1);
      border-bottom: 2px solid #2196F3;
      padding: 2px 4px;
      border-radius: 2px;
      position: relative;
      display: inline;
    }

    .chapter-content {
      user-select: text;
    }

    @media (max-width: 1200px) {
      .main-content {
        &.comments-open {
          margin-right: 380px;
          max-width: calc(100% - 380px);
        }
      }

      .comments-panel {
        width: 380px;
      }
    }

    @media (max-width: 768px) {
      .main-content {
        &.comments-open {
          margin-right: 0;
          max-width: 100%;
        }
      }

      .comments-panel {
        width: 100%;
        right: -100%;
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
  isCommentsPanelOpen = false;
  selectedText: Selection | null = null;
  selectionMenuPosition = { top: '0', left: '0' };
  showSelectionMenu = false;
  showSnackbar = false;
  savedSelections: { [key: string]: boolean } = {};

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

    // Load saved selections
    this.loadSavedSelections();
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
        // Load saved phrases after chapter content is loaded
        setTimeout(() => {
          this.loadSavedSelections();
        }, 100);
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

  toggleComments() {
    this.isCommentsPanelOpen = !this.isCommentsPanelOpen;
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

  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      this.showSelectionMenu = false;
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText || !this.isValidSelection(event)) {
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    this.selectedText = {
      text: selectedText,
      startOffset: range.startOffset,
      endOffset: range.endOffset
    };

    this.selectionMenuPosition = {
      top: `${rect.top + window.scrollY - 10}px`,
      left: `${rect.left + (rect.width / 2)}px`
    };

    this.showSelectionMenu = true;
  }

  private isValidSelection(event: MouseEvent): boolean {
    const target = event.target as HTMLElement;
    return target.closest('.chapter-content') !== null;
  }

  addCommentToSelection() {
    if (!this.selectedText) return;
    
    this.isCommentsPanelOpen = true;
    this.newComment = `"${this.selectedText.text}" - `;
    // Focus the comment input
    setTimeout(() => {
      const commentInput = document.querySelector('.comment-form input') as HTMLInputElement;
      if (commentInput) {
        commentInput.focus();
      }
    }, 100);
    this.showSelectionMenu = false;
  }

  saveSelection() {
    if (!this.selectedText) return;
    
    const savedSelections = JSON.parse(localStorage.getItem('savedSelections') || '[]');
    savedSelections.push({
      ...this.selectedText,
      chapterId: this.chapter.id,
      bookId: this.bookId,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('savedSelections', JSON.stringify(savedSelections));
    
    // Mark the newly saved phrase
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const wrapper = document.createElement('span');
      wrapper.className = 'saved-phrase-wrapper';
      wrapper.textContent = this.selectedText.text;
      range.surroundContents(wrapper);
    }

    this.showSnackbar = true;
    setTimeout(() => {
      this.showSnackbar = false;
    }, 3000);

    this.showSelectionMenu = false;
  }

  isSavedText(text: string): boolean {
    return this.savedSelections[text] || false;
  }

  loadSavedSelections() {
    const saved = localStorage.getItem('savedSelections');
    if (saved) {
      const savedPhrases = JSON.parse(saved);
      // After loading chapter content, mark saved phrases
      setTimeout(() => {
        this.markSavedPhrases(savedPhrases);
      }, 100);
    }
  }

  markSavedPhrases(savedPhrases: SavedSelection[]) {
    const content = document.querySelector('.chapter-content');
    if (!content) return;

    savedPhrases.forEach(phrase => {
      if (phrase.chapterId === this.chapter.id) {
        const textNodes = this.findTextNodes(content);
        textNodes.forEach(node => {
          const text = node.textContent || '';
          if (text.includes(phrase.text)) {
            const wrapper = document.createElement('span');
            wrapper.className = 'saved-phrase-wrapper';
            wrapper.textContent = phrase.text;
            const range = document.createRange();
            range.setStart(node, text.indexOf(phrase.text));
            range.setEnd(node, text.indexOf(phrase.text) + phrase.text.length);
            range.surroundContents(wrapper);
          }
        });
      }
    });
  }

  // Helper method to find all text nodes
  private findTextNodes(node: Node): Text[] {
    const textNodes: Text[] = [];
    const walk = document.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentNode: Node | null = walk.nextNode();
    while (currentNode) {
      textNodes.push(currentNode as Text);
      currentNode = walk.nextNode();
    }

    return textNodes;
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

interface SavedSelection {
  text: string;
  startOffset: number;
  endOffset: number;
  chapterId: number;
  bookId: number;
  savedAt: string;
  note?: string;
}

interface Selection {
  text: string;
  startOffset: number;
  endOffset: number;
  note?: string;
} 