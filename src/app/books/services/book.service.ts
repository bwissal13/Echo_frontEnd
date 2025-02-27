import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book, CreateBookRequest, UpdateBookRequest, BookPage, Chapter, CreateChapterRequest, UpdateChapterRequest } from '../models/book.interface';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly API_URL = `${environment.apiUrl}/books`;

  constructor(private http: HttpClient) {}

  getBooks(page: number = 0, size: number = 10, search?: string): Observable<BookPage> {
    let url = `${this.API_URL}?page=${page}&size=${size}`;
    if (search) {
      url += `&search=${search}`;
    }
    return this.http.get<BookPage>(url);
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.API_URL}/${id}`);
  }

  getMyBooks(page: number = 0, size: number = 10): Observable<BookPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<BookPage>(`${this.API_URL}/me`, { params });
  }

  createBook(book: CreateBookRequest): Observable<Book> {
    return this.http.post<Book>(this.API_URL, book);
  }

  updateBook(id: number, book: UpdateBookRequest): Observable<Book> {
    return this.http.put<Book>(`${this.API_URL}/${id}`, book);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  uploadCoverImage(file: File): Observable<{url: string}> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        observer.next({ url: e.target.result });
        observer.complete();
      };
      reader.onerror = (error) => {
        observer.error(error);
      };
      reader.readAsDataURL(file);
    });
  }

  uploadImage(file: File): Observable<{url: string}> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        observer.next({ url: e.target.result });
        observer.complete();
      };
      reader.onerror = (error) => {
        observer.error(error);
      };
      reader.readAsDataURL(file);
    });
  }

  getChapters(bookId: number): Observable<Chapter[]> {
    return this.http.get<Chapter[]>(`${this.API_URL}/${bookId}/chapters`);
  }

  getChapter(bookId: number, chapterId: number): Observable<Chapter> {
    return this.http.get<Chapter>(`${this.API_URL}/${bookId}/chapters/${chapterId}`);
  }

  createChapter(bookId: number, chapter: CreateChapterRequest): Observable<Chapter> {
    return this.http.post<Chapter>(`${this.API_URL}/${bookId}/chapters`, chapter);
  }

  updateChapter(bookId: number, chapterId: number, chapter: UpdateChapterRequest): Observable<Chapter> {
    return this.http.put<Chapter>(`${this.API_URL}/${bookId}/chapters/${chapterId}`, chapter);
  }

  deleteChapter(bookId: number, chapterId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${bookId}/chapters/${chapterId}`);
  }

  reorderChapters(bookId: number, chapterIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${bookId}/chapters/reorder`, { chapterIds });
  }
} 