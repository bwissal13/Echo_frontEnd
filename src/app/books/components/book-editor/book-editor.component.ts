import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { quillConfig } from '../../config/quill-config';
import { BookService } from '../../services/book.service';
import { Genre, CreateChapterRequest, Chapter, Book, UpdateChapterRequest } from '../../models/book.interface';
import { QuillEditorComponent } from 'ngx-quill';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChapterListComponent } from '../chapter-list/chapter-list.component';
import { ChapterDialogComponent } from '../chapter-dialog/chapter-dialog.component';
import { Subject, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
    QuillModule,
    ChapterListComponent
  ],
  templateUrl: './book-editor.component.html',
  styleUrls: ['./book-editor.component.scss']
})
export class BookEditorComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('quillEditor') quillEditor!: QuillEditorComponent;
  @ViewChild('slashMenu') slashMenu!: ElementRef;
  
  coverImage: string = '';
  bookTitle: string = '';
  bookContent: string = '';
  chapters: Chapter[] = [];
  currentChapter: Chapter | null = null;
  bookId: number | null = null;
  quillModules = quillConfig.modules || {};
  lastEdited: Date = new Date();
  coverImageUrl: string = '';
  private contentChange = new Subject<string>();
  private titleChange = new Subject<string>();
  private autoSaveSubscription!: Subscription;
  showSlashMenu = false;
  slashMenuPosition = { top: 0, left: 0 };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookService: BookService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du livre si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.bookId = +params['id'];
        this.loadBook(this.bookId);
      }
    });

    // Configurer la sauvegarde automatique
    this.autoSaveSubscription = merge(
      this.contentChange.pipe(
        debounceTime(1000),
        distinctUntilChanged()
      ),
      this.titleChange.pipe(
        debounceTime(1000),
        distinctUntilChanged()
      )
    ).subscribe(() => {
      if (this.bookId) {
        this.saveAsDraft();
      }
    });
  }

  ngAfterViewInit() {
    const quill = this.quillEditor.quillEditor;
    quill.on('text-change', (delta: any, oldDelta: any, source: string) => {
      if (source === 'user' && delta.ops?.some((op: any) => op.insert === '/')) {
        this.showSlashCommand();
      }
    });

    quill.root.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.showSlashMenu) {
        this.showSlashMenu = false;
      }
    });
  }

  loadBook(id: number): void {
    this.bookService.getBook(id).subscribe({
      next: (book: Book) => {
        this.bookTitle = book.title;
        this.bookContent = book.description;
        this.coverImage = book.coverImage;
        this.chapters = book.chapters || [];
        this.lastEdited = new Date(book.updatedAt);
        this.coverImageUrl = this.coverImage ? `url(${this.coverImage})` : 'none';
      },
      error: (error: any) => {
        console.error('Error loading book:', error);
        this.showErrorMessage('Failed to load book');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/books']);
  }

  saveAsDraft(): void {
    const book = {
      title: this.bookTitle,
      description: this.bookContent,
      genre: Genre.FICTION,
      isPublic: false,
      coverImage: this.coverImage
    };

    if (this.bookId) {
      // Update existing book
      this.bookService.updateBook(this.bookId, book).subscribe({
        next: (response) => {
          console.log('Book saved as draft:', response);
          this.showSuccessMessage('Book saved as draft');
        },
        error: (error) => {
          console.error('Error saving book:', error);
          this.showErrorMessage('Failed to save book');
        }
      });
    } else {
      // Create new book
      this.bookService.createBook(book).subscribe({
        next: (response) => {
          console.log('Book created as draft:', response);
          this.bookId = response.id;
          this.showSuccessMessage('Book saved as draft');
        },
        error: (error) => {
          console.error('Error creating book:', error);
          this.showErrorMessage('Failed to create book');
        }
      });
    }
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }

  publish(): void {
    const book = {
      title: this.bookTitle,
      description: this.bookContent,
      genre: Genre.FICTION, // À modifier selon les besoins
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
            this.showSuccessMessage('Cover image uploaded successfully');
          },
          error: (error) => {
            console.error('Error uploading cover image:', error);
            this.showErrorMessage('Failed to upload cover image');
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
            const quill = this.quillEditor.quillEditor;
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', response.url);
          },
          error: (error) => {
            console.error('Error uploading image:', error);
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
            this.showSuccessMessage('Chapter updated successfully');
          },
          error: (error: any) => {
            console.error('Error updating chapter:', error);
            this.showErrorMessage('Failed to update chapter');
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

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        this.bookService.uploadCoverImage(file).subscribe({
          next: (response) => {
            this.coverImage = response.url;
            this.coverImageUrl = `url('${this.coverImage}')`;
            this.onTitleChange(); // Trigger auto-save
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

  onTitleChange(): void {
    this.titleChange.next(this.bookTitle);
    this.lastEdited = new Date();
  }

  onContentChange(): void {
    this.contentChange.next(this.bookContent);
    this.lastEdited = new Date();
  }

  showSlashCommand() {
    const quill = this.quillEditor.quillEditor;
    const selection = quill.getSelection();
    if (!selection) return;

    const bounds = quill.getBounds(selection.index);
    this.slashMenuPosition = {
      top: bounds.top + bounds.height + 10,
      left: bounds.left
    };
    this.showSlashMenu = true;
  }

  insertImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.bookService.uploadImage(file).subscribe({
          next: (response) => {
            const quill = this.quillEditor.quillEditor;
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', response.url);
            quill.insertText(range.index + 1, '\n', 'user');
            quill.setSelection(range.index + 2, 0);
            this.showSlashMenu = false;
          },
          error: (error) => {
            console.error('Error processing image:', error);
            this.showErrorMessage('Failed to process image');
          }
        });
      }
    };
    input.click();
  }

  ngOnDestroy(): void {
    if (this.autoSaveSubscription) {
      this.autoSaveSubscription.unsubscribe();
    }
  }
} 