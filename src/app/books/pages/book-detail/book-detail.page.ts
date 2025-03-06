import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { BookService } from '../../services/book.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Subscription } from 'rxjs';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userFullName: string;
  userAvatar: string;
  likesCount: number;
  isLiked: boolean;
  parentCommentId?: number;
  replies?: Comment[];
  showReplies?: boolean;
}

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    FormsModule,
    SidebarComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  templateUrl: './book-detail.page.html',
  styleUrls: ['./book-detail.page.scss']
})
export class BookDetailPage implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  book: any;
  loading = false;
  error = '';
  comments: Comment[] = [];
  newComment = '';
  isAuthenticated = false;
  replyingTo: number | null = null;
  replyContent = '';
  activeTab: 'description' | 'chapters' | 'comments' = 'description';
  currentUserAvatar = '';
  currentUserName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private authService: AuthService
  ) {
    // Initialize with default values
    this.currentUserAvatar = 'assets/images/default-avatar.png';
    this.currentUserName = 'Anonymous';
    
    // Subscribe to get user data
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

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.loadBook(+bookId);
    }
  }

  loadBook(id: number) {
    this.loading = true;
    this.error = '';

    const subscription = this.bookService.getBook(id).subscribe({
      next: (response: any) => {
        this.book = response;
        this.loading = false;
        this.loadComments();
      },
      error: (err: any) => {
        this.error = 'Failed to load book details. Please try again.';
        this.loading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  loadComments() {
    if (!this.book?.id) return;
    
    const subscription = this.bookService.getBookComments(this.book.id).subscribe({
      next: (comments: Comment[]) => {
        // Separate root comments and replies
        const rootComments: Comment[] = [];
        const replies: Comment[] = [];
        
        comments.forEach(comment => {
          // Add default avatar if not present
          const processedComment = {
            ...comment,
            userAvatar: comment.userAvatar || 'assets/images/default-avatar.png',
            showReplies: false,
            replies: []
          };

          if (comment.parentCommentId) {
            replies.push(processedComment);
          } else {
            rootComments.push(processedComment);
          }
        });

        // Attach replies to their parent comments
        replies.forEach(reply => {
          const parentComment = rootComments.find(c => c.id === reply.parentCommentId);
          if (parentComment) {
            if (!parentComment.replies) {
              parentComment.replies = [];
            }
            parentComment.replies.push(reply);
          }
        });

        this.comments = rootComments;
      },
      error: (err) => {
        console.error('Failed to load comments:', err);
        this.error = 'Failed to load comments. Please try again.';
      }
    });

    this.subscriptions.push(subscription);
  }

  getBookCoverUrl(coverImage: string | null): string {
    return this.bookService.getBookCoverUrl(coverImage);
  }

  startReading() {
    if (this.book?.chapters?.length > 0) {
      const firstChapter = this.book.chapters[0];
      this.readChapter(firstChapter.id);
    }
  }

  readChapter(chapterId: number) {
    this.router.navigate(['/books/chapters', chapterId]);
  }

  toggleSubscription() {
    if (!this.isAuthenticated) {
      // Handle unauthenticated user
      return;
    }

    this.bookService.toggleBookSubscription(this.book.id).subscribe({
      next: (response: { isSubscribed: boolean }) => {
        this.book.isSubscribed = !this.book.isSubscribed;
      },
      error: (err: any) => {
        console.error('Error toggling subscription:', err);
      }
    });
  }

  addComment() {
    if (!this.newComment.trim() || !this.isAuthenticated || !this.book?.id) {
      return;
    }

    this.bookService.addBookComment(this.book.id, this.newComment).subscribe({
      next: (response: Comment) => {
        this.comments.unshift({
          ...response,
          userAvatar: response.userAvatar || 'assets/images/default-avatar.png',
          showReplies: false
        });
        this.newComment = '';
      },
      error: (err) => {
        console.error('Failed to add comment:', err);
        this.error = 'Failed to add comment. Please try again.';
      }
    });
  }

  toggleReply(commentId: number) {
    this.replyingTo = this.replyingTo === commentId ? null : commentId;
    this.replyContent = '';
  }

  addReply(commentId: number) {
    if (!this.replyContent.trim() || !this.isAuthenticated || !this.book?.id) {
      return;
    }

    this.bookService.addCommentReply(
      this.book.id,
      commentId,
      this.replyContent
    ).subscribe({
      next: (response: Comment) => {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
          if (!comment.replies) {
            comment.replies = [];
          }
          comment.replies.push({
            ...response,
            userAvatar: response.userAvatar || 'assets/images/default-avatar.png'
          });
          comment.showReplies = true;
        }
        this.cancelReply();
      },
      error: (err) => {
        console.error('Failed to add reply:', err);
        this.error = 'Failed to add reply. Please try again.';
      }
    });
  }

  likeComment(comment: Comment) {
    if (!this.isAuthenticated) {
      return;
    }

    this.bookService.toggleCommentLike(comment.id).subscribe({
      next: (response: { likesCount: number }) => {
        comment.isLiked = !comment.isLiked;
        comment.likesCount = response.likesCount;
      },
      error: (err: any) => {
        console.error('Error toggling comment like:', err);
      }
    });
  }

  getTotalLikes(): number {
    return this.comments.reduce((total, comment) => {
      return total + (comment.likesCount || 0);
    }, 0);
  }

  reportComment(comment: Comment) {
    console.log('Report comment:', comment);
  }

  cancelReply() {
    this.replyingTo = null;
    this.replyContent = '';
  }

  likeReply(reply: Comment) {
    if (!this.isAuthenticated) {
      return;
    }

    this.bookService.toggleCommentLike(reply.id).subscribe({
      next: (response: { likesCount: number }) => {
        reply.isLiked = !reply.isLiked;
        reply.likesCount = response.likesCount;
      },
      error: (err: any) => {
        console.error('Error toggling reply like:', err);
      }
    });
  }

  getRepliesCount(comment: Comment): number {
    return comment.replies?.length || 0;
  }

  toggleReplies(comment: Comment) {
    if (!comment.showReplies && !comment.replies) {
      // Load replies if not already loaded
      this.bookService.getCommentReplies(comment.id).subscribe({
        next: (replies: Comment[]) => {
          comment.replies = replies.map(reply => ({
            ...reply,
            userAvatar: reply.userAvatar || 'assets/images/default-avatar.png'
          }));
          comment.showReplies = true;
        },
        error: (err) => {
          console.error('Failed to load replies:', err);
          this.error = 'Failed to load replies. Please try again.';
        }
      });
    } else {
      comment.showReplies = !comment.showReplies;
    }
  }

  ngOnDestroy() {
    // Clean up all subscriptions when component is destroyed
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
} 