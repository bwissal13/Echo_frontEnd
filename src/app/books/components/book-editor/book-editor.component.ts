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
import { ChapterEditorComponent } from '../chapter-editor/chapter-editor.component';
import { ChapterService } from '../../services/chapter.service';
import { DeleteConfirmationDialog } from '../../../shared/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, tap, throwError } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { map, filter, mergeMap, finalize } from 'rxjs/operators';

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
    MatTooltipModule
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
  isLoading = false;
  trashedChaptersCount = 0;
  showTrashAside = false;
  trashedBooks: any[] = [];
  trashedBooksCount = 0;
  loading = true;
  book: Book | null = null;
  originalBook: Book | null = null;
  pageIndex = 0;
  pageSize = 10;
  totalChapters = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookService: BookService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private chapterService: ChapterService
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

    this.loadChapters();
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
    this.loading = true;
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(id => !!id),
      map(id => parseInt(id!, 10)),
      mergeMap(id => this.bookService.getBook(id)),
      finalize(() => this.loading = false)
    ).subscribe({
      next: (book) => {
        this.book = book;
        this.originalBook = { ...book };
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
        const message = error.status === 429 
          ? 'Too many requests. Please wait a moment and try again.'
          : 'Failed to load book details';
        this.snackBar.open(message, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        if (error.status === 401) {
          this.handleAuthError();
        }
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
    if (!this.bookId) {
      this.showSnackBar('Please save the book first before adding chapters', 'error');
      return;
    }

    const newChapter: Partial<Chapter> = {
      title: '',
      content: '',
      order: this.chapters.length + 1,
      bookId: this.bookId
    };

    const dialogRef = this.dialog.open(ChapterEditorComponent, {
      width: '100%',
      height: '100%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'fullscreen-dialog',
      data: { chapter: newChapter, isEditing: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.chapterService.createChapter(result).subscribe({
          next: (createdChapter) => {
            this.chapters.push(createdChapter);
            this.saveBook(); // Save the book to update chapters
            this.showSnackBar('Chapter created successfully', 'success');
          },
          error: (error) => {
            console.error('Error creating chapter:', error);
            if (error.status === 403) {
              this.handleAuthError();
            } else {
              this.showSnackBar('Failed to create chapter: ' + (error.error?.message || 'Unknown error'), 'error');
            }
          }
        });
      }
    });
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
    const dialogRef = this.dialog.open(ChapterEditorComponent, {
      width: '100%',
      height: '100%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'fullscreen-dialog',
      data: { chapter: { ...chapter }, isEditing: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.chapterService.updateChapter(chapter.id, result).subscribe({
          next: (updatedChapter) => {
            const index = this.chapters.findIndex(c => c.id === chapter.id);
            if (index !== -1) {
              this.chapters[index] = updatedChapter;
              this.updateBookDetails();
            }
            this.showSnackBar('Chapter updated successfully', 'success');
          },
          error: (error) => {
            console.error('Error updating chapter:', error);
            this.showSnackBar('Failed to update chapter', 'error');
          }
        });
      }
    });
  }

  deleteChapter(chapter: Chapter): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Delete Chapter',
        message: 'Do you want to move this chapter to trash or delete it permanently?',
        options: ['Move to Trash', 'Delete Permanently', 'Cancel']
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'Move to Trash') {
        this.moveChapterToTrash(chapter);
      } else if (result === 'Delete Permanently') {
        this.permanentDeleteChapter(chapter);
      }
    });
  }

  public moveChapterToTrash(chapter: Chapter): void {
    this.chapterService.moveToTrash(chapter.id).subscribe({
      next: () => {
        const index = this.chapters.findIndex(c => c.id === chapter.id);
        if (index !== -1) {
          this.chapters.splice(index, 1);
          this.reorderChapters();
          this.saveBook();
        }
        this.trashedChaptersCount++;
        this.showSnackBar('Chapter moved to trash', 'success');
      },
      error: (error) => {
        console.error('Error moving chapter to trash:', error);
        if (error.status === 403) {
          this.handleAuthError();
        } else {
          this.showSnackBar('Failed to move chapter to trash', 'error');
        }
      }
    });
  }

  public permanentDeleteChapter(chapter: Chapter): void {
    const confirmRef = this.dialog.open(DeleteConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Permanent Delete',
        message: 'This action cannot be undone. Are you sure you want to permanently delete this chapter?',
        confirmText: 'Delete',
        isPermanent: true
      }
    });

    confirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.chapterService.permanentDelete(chapter.id).subscribe({
          next: () => {
            const index = this.chapters.findIndex(c => c.id === chapter.id);
            if (index !== -1) {
              this.chapters.splice(index, 1);
              this.reorderChapters();
              this.saveBook();
            }
            this.showSnackBar('Chapter permanently deleted', 'success');
          },
          error: (error) => {
            console.error('Error deleting chapter:', error);
            if (error.status === 403) {
              this.handleAuthError();
            } else {
              this.showSnackBar('Failed to delete chapter', 'error');
            }
          }
        });
      }
    });
  }

  private reorderChapters(): void {
    this.chapters = this.chapters.map((ch, idx) => ({
      ...ch,
      order: idx + 1
    }));
  }

  onChaptersReordered(chapters: Chapter[]): void {
    this.chapters = chapters.map((chapter, index) => ({
      ...chapter,
      order: index + 1
    }));
    this.updateBookDetails();
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
    this.showSnackBar('Please log in to continue', 'error');
    this.router.navigate(['/auth/login']);
  }

  loadChapters(): void {
    if (!this.book?.id) return;
    
    this.bookService.getChapters(this.book.id, this.pageIndex, this.pageSize).subscribe({
      next: (response) => {
        this.chapters = response.content;
        this.totalChapters = response.totalElements;
      },
      error: (error) => {
        console.error('Error loading chapters:', error);
        const message = error.status === 429 
          ? 'Too many requests. Please wait a moment and try again.'
          : 'Failed to load chapters';
        this.snackBar.open(message, 'Close', {
          duration: 5000
        });
      }
    });
  }

  openTrash(): void {
    this.showTrashAside = true;
    this.loadTrashedBooks();
  }

  private loadTrashedBooks(): void {
    this.bookService.getTrashBooks().subscribe({
      next: (response: any) => {
        this.trashedBooks = response.books;
        this.trashedBooksCount = this.trashedBooks.length;
      },
      error: (error: any) => {
        console.error('Error loading trashed books:', error);
        this.showSnackBar('Failed to load trashed books', 'error');
      }
    });
  }

  closeTrashAside(): void {
    this.showTrashAside = false;
  }

  async restoreBook(book: any): Promise<void> {
    try {
      await this.bookService.restoreFromTrash(book.id).toPromise();
      await this.loadTrashedBooks();
      this.showSnackBar('Book restored successfully', 'success');
    } catch (error) {
      this.showSnackBar('Failed to restore book', 'error');
    }
  }

  async permanentDeleteBook(book: any): Promise<void> {
    const dialogData: ConfirmDialogData = {
      title: 'Delete Permanently',
      message: 'This action cannot be undone. Are you sure you want to permanently delete this book?',
      confirmText: 'Delete Permanently',
      confirmColor: 'warn'
    };

    const confirm = await this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '400px'
    }).afterClosed().toPromise();

    if (confirm) {
      try {
        await this.bookService.permanentDelete(book.id).toPromise();
        await this.loadTrashedBooks();
        this.showSnackBar('Book deleted permanently', 'success');
      } catch (error) {
        this.showSnackBar('Failed to delete book', 'error');
      }
    }
  }

  async deleteBook(): Promise<void> {
    if (!this.bookId) return;

    const dialogData: ConfirmDialogData = {
      title: 'Move to Trash',
      message: 'Are you sure you want to move this book to trash? You can restore it later from the trash.',
      confirmText: 'Move to Trash',
      confirmColor: 'warn'
    };

    const confirm = await this.dialog.open(ConfirmDialogComponent, {
      data: dialogData,
      width: '400px'
    }).afterClosed().toPromise();

    if (confirm) {
      try {
        await this.bookService.moveToTrash(this.bookId).pipe(
          tap(() => {
            this.showSnackBar('Book moved to trash', 'success');
            this.router.navigate(['/books']);
          }),
          catchError(error => {
            console.error('Error moving book to trash:', error);
            this.showSnackBar('Failed to move book to trash', 'error');
            return throwError(() => error);
          })
        ).toPromise();
      } catch (error) {
        console.error('Error moving book to trash:', error);
        this.showSnackBar('Failed to move book to trash', 'error');
      }
    }
  }
} 