import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { BookService } from '../../services/book.service';
import { Genre, CreateChapterRequest, Chapter, Book, UpdateChapterRequest, CreateBookRequest, UpdateBookRequest } from '../../models/book.interface';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChapterListComponent } from '../chapter-list/chapter-list.component';
import { ChapterDialogComponent } from '../chapter-dialog/chapter-dialog.component';
import { Subject, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../../auth/services/auth.service';
import { BecomeAuthorDialogComponent } from '../become-author-dialog/become-author-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-book-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    ChapterListComponent
  ],
  templateUrl: './book-editor.component.html',
  styleUrls: ['./book-editor.component.scss']
})
export class BookEditorComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  coverImage: string = '';
  bookTitle: string = '';
  bookContent: string = '';
  chapters: Chapter[] = [];
  currentChapter: Chapter | null = null;
  bookId: number | null = null;
  lastEdited: Date = new Date();
  coverImageUrl: string | null = null;
  private contentChange = new Subject<string>();
  private titleChange = new Subject<string>();
  private autoSaveSubscription?: Subscription;
  genres = Object.values(Genre);
  selectedGenre: Genre = Genre.FICTION;
  errorMessage: string | null = null;
  isBookSaved = false;
  private readonly API_URL = 'http://localhost:8080'; // Use direct URL for now
  bookSubtitle: string = '';
  authorName: string = '';
  private readonly DEFAULT_COVER = 'assets/images/default-book-cover.jpg';
  isUploading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookService: BookService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const bookId = this.route.snapshot.params['id'];
    if (bookId) {
      this.bookId = bookId;
      this.loadBook(bookId);
    }

    // Setup auto-save
    this.autoSaveSubscription = merge(
      this.contentChange.pipe(debounceTime(2000)),
      this.titleChange.pipe(debounceTime(2000))
    ).subscribe(() => {
      if (this.bookId) {
        this.saveBook();
      }
    });

    // Set default cover image immediately
    if (!this.coverImageUrl) {
      this.coverImageUrl = `url('${this.DEFAULT_COVER}')`;
    }
  }

  getImageUrl(coverImage: string | null): string {
    if (!coverImage) {
      return this.DEFAULT_COVER;
    }
    return coverImage.startsWith('http') 
      ? coverImage 
      : `${this.API_URL}${coverImage}`;
  }

  loadBook(id: number): void {
    this.bookService.getBook(id).subscribe({
      next: (book) => {
        this.bookTitle = book.title;
        this.bookContent = book.description;
        this.coverImage = book.coverImage;
        this.selectedGenre = book.genre;
        this.chapters = book.chapters || [];
        this.lastEdited = new Date(book.updatedAt);
        this.coverImageUrl = `url('${this.bookService.getImageUrl(book.coverImage)}')`;
      },
      error: (error) => {
        console.error('Error loading book:', error);
        this.showSnackBar('Failed to load book', 'error');
      }
    });
  }

  saveBook(): void {
    if (!this.bookTitle.trim()) {
      this.showSnackBar('Book title is required', 'error');
      return;
    }

    // Show loading state
    this.isUploading = true;

    // Prepare the book data
    const bookData = {
      title: this.bookTitle.trim(),
      description: this.bookContent || '',
      genre: this.selectedGenre,
      isPublic: false,
      coverImage: this.coverImage || undefined,
      subtitle: this.bookSubtitle,
      authorName: this.authorName,
      chapters: this.chapters || []
    };

    // Determine if we're updating or creating
    if (this.bookId) {
      // Update existing book
      this.bookService.updateBook(this.bookId, bookData).subscribe({
        next: (response) => {
          console.log('Book updated successfully:', response);
          this.isBookSaved = true;
          this.isUploading = false;
          this.lastEdited = new Date();
          this.showSnackBar('Book updated successfully!', 'success');
        },
        error: (error) => {
          console.error('Error updating book:', error);
          this.isUploading = false;
          if (error.status === 403) {
            this.handleAuthError();
          } else {
            this.showSnackBar(error.message || 'Failed to update book', 'error');
          }
        }
      });
    } else {
      // Create new book
      this.bookService.createBook(bookData).subscribe({
        next: (response) => {
          console.log('Book created successfully:', response);
          this.isBookSaved = true;
          this.isUploading = false;
          this.showSnackBar('Book created successfully!', 'success');
          this.router.navigate(['/books']);
        },
        error: (error) => {
          console.error('Error creating book:', error);
          this.isUploading = false;
          if (error.status === 403) {
            this.handleAuthError();
          } else {
            this.showSnackBar(error.message || 'Failed to create book', 'error');
          }
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.isUploading = true;
    this.showSnackBar('Uploading image...', 'info');

    this.bookService.uploadCoverImage(file).subscribe({
      next: (response) => {
        console.log('Upload response:', response);
        this.coverImage = response.url;
        this.coverImageUrl = `url('${this.bookService.getImageUrl(response.url)}')`;
        this.isUploading = false;
        this.showSnackBar('Cover image uploaded successfully', 'success');
        
        if (this.bookId) {
          this.updateBookCover(response.url);
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.isUploading = false;
        this.showSnackBar(error.message || 'Failed to upload image', 'error');
        this.coverImageUrl = `url('${this.DEFAULT_COVER}')`;
      }
    });
  }

  private updateBookCover(imageUrl: string): void {
    if (!this.bookId) return;

    const updateData: UpdateBookRequest = {
      title: this.bookTitle,
      description: this.bookContent,
      genre: this.selectedGenre,
      isPublic: false,
      coverImage: imageUrl || undefined
    };
    
    this.bookService.updateBook(this.bookId, updateData).subscribe({
      next: () => {
        this.lastEdited = new Date();
      },
      error: (error) => {
        console.error('Error updating book with new cover:', error);
        this.showSnackBar('Failed to update book with new cover', 'error');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/books']);
  }

  publish(): void {
    const book = {
      title: this.bookTitle,
      description: this.bookContent,
      genre: this.selectedGenre,
      isPublic: true,
      coverImage: this.coverImage
    };

    this.bookService.createBook(book).subscribe({
      next: (response) => {
        console.log('Book published:', response);
        this.router.navigate(['/books']);
      },
      error: (error) => {
        console.error('Error publishing book:', error);
      }
    });
  }

  changeCover(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.bookService.uploadCoverImage(file).subscribe({
          next: (response) => {
            this.coverImage = response.url;
            this.coverImageUrl = `url(${this.coverImage})`;
            this.showSnackBar('Cover image uploaded successfully', 'success');
          },
          error: (error) => {
            console.error('Error uploading cover image:', error);
            this.showSnackBar('Failed to upload cover image', 'error');
          }
        });
      }
    };
    input.click();
  }

  addImage(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.bookService.uploadImage(file).subscribe({
          next: (response) => {
            // Instead of using Quill, we'll append the image URL to the content
            const imageTag = `\n<img src="${response.url}" alt="Uploaded image" />\n`;
            this.bookContent += imageTag;
            this.onContentChange(this.bookContent);
          },
          error: (error) => {
            console.error('Error uploading image:', error);
            this.showSnackBar('Failed to upload image', 'error');
          }
        });
      }
    };
    input.click();
  }

  addSubpage(): void {
    // Open in new tab/window
    const newPageUrl = `/books/new?parentId=${this.bookId}`;
    window.open(newPageUrl, '_blank');
  }

  addInlinePage(): void {
    const dialogRef = this.dialog.open(ChapterDialogComponent, {
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      panelClass: 'fullscreen-dialog',
      data: {
        parentId: this.bookId,
        title: '',
        content: ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.chapters.push({
          id: Date.now(),
          bookId: this.bookId!,
          title: result.title,
          content: result.content,
          order: this.chapters.length
        });
      }
    });
  }

  editChapter(chapter: Chapter): void {
    const dialogRef = this.dialog.open(ChapterDialogComponent, {
      width: '800px',
      data: { ...chapter }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.bookId) {
        const updatedChapter: UpdateChapterRequest = {
          title: result.title,
          content: result.content,
          order: chapter.order
        };

        this.bookService.updateChapter(this.bookId, chapter.id, updatedChapter).subscribe({
          next: (updated: Chapter) => {
            const index = this.chapters.findIndex(c => c.id === chapter.id);
            if (index !== -1) {
              this.chapters[index] = updated;
            }
            this.showSnackBar('Chapter updated successfully', 'success');
          },
          error: (error: any) => {
            console.error('Error updating chapter:', error);
            this.showSnackBar('Failed to update chapter', 'error');
          }
        });
      }
    });
  }

  deleteChapter(chapter: Chapter): void {
    if (confirm('Are you sure you want to delete this chapter?') && this.bookId) {
      this.bookService.deleteChapter(this.bookId, chapter.id).subscribe({
        next: () => {
          this.chapters = this.chapters.filter(c => c.id !== chapter.id);
        }
      });
    }
  }

  onChaptersReordered(chapters: Chapter[]): void {
    if (this.bookId) {
      const chapterIds = chapters.map(c => c.id);
      this.bookService.reorderChapters(this.bookId, chapterIds).subscribe();
    }
  }

  onTitleChange(): void {
    this.lastEdited = new Date();
  }

  onContentChange(content: string): void {
    this.bookContent = content;
    this.lastEdited = new Date();
    this.contentChange.next(content);
  }

  selectGenre(genre: string): void {
    this.selectedGenre = genre as Genre;
  }

  ngOnDestroy(): void {
    if (this.autoSaveSubscription) {
      this.autoSaveSubscription.unsubscribe();
    }
  }

  dismissError(): void {
    this.errorMessage = null;
  }

  private showBecomeAuthorDialog(): void {
    const dialogRef = this.dialog.open(BecomeAuthorDialogComponent, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        this.router.navigate(['/books']);
      }
    });
  }

  private showSnackBar(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: type === 'info' ? undefined : 3000,
      panelClass: [`${type}-snackbar`]
    });
  }

  // Add a method for updating book details
  updateBookDetails(): void {
    if (!this.bookId) return;

    // Create a complete update request with all required fields
    const updateData: UpdateBookRequest = {
      title: this.bookTitle,
      description: this.bookContent,
      genre: this.selectedGenre,
      isPublic: false,
      coverImage: this.coverImage
    };
    
    this.bookService.updateBook(this.bookId, updateData).subscribe({
      next: () => {
        this.lastEdited = new Date();
        this.showSnackBar('Book updated successfully', 'success');
      },
      error: (error) => {
        console.error('Error updating book:', error);
        if (error.status === 403) {
          this.handleAuthError();
        } else {
          this.showSnackBar('Failed to update book', 'error');
        }
      }
    });
  }

  removeCover(): void {
    this.coverImage = '';
    this.coverImageUrl = null;
    
    if (this.bookId) {
      const updateData: UpdateBookRequest = {
        title: this.bookTitle,
        description: this.bookContent,
        genre: this.selectedGenre,
        isPublic: false,
        coverImage: undefined
      };
      
      this.bookService.updateBook(this.bookId, updateData).subscribe({
        next: () => {
          this.lastEdited = new Date();
          this.showSnackBar('Cover image removed successfully', 'success');
        },
        error: (error) => {
          console.error('Error removing cover:', error);
          if (error.status === 403) {
            this.handleAuthError();
          } else {
            this.showSnackBar('Failed to remove cover image', 'error');
          }
        }
      });
    }
  }

  private handleAuthError(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.showSnackBar('Your session has expired. Please log in again.', 'error');
    localStorage.setItem('redirectUrl', this.router.url);
    this.router.navigate(['/login']);
  }
} 