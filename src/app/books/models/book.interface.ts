export interface Book {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  genre: Genre;
  isPublic: boolean;
  chapters?: Chapter[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Author {
  id: number;
  firstname: string;
  lastname: string;
}

export enum Genre {
  FICTION = 'FICTION',
  NON_FICTION = 'NON_FICTION',
  SCIENCE_FICTION = 'SCIENCE_FICTION',
  MYSTERY = 'MYSTERY',
  ROMANCE = 'ROMANCE',
  FANTASY = 'FANTASY'
}

export interface CreateBookRequest {
  title: string;
  description: string;
  genre: Genre;
  isPublic: boolean;
  coverImage?: string;
}

export interface UpdateBookRequest {
  title: string;
  description: string;
  genre: Genre;
  isPublic: boolean;
  coverImage?: string | null;
}

export interface BookPage {
  content: Book[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Chapter {
  id: number;
  title: string;
  content: string;
  order: number;
  bookId: number;
}

export interface CreateChapterRequest {
  title: string;
  content: string;
  order: number;
  bookId: number;
}

export interface UpdateChapterRequest {
  title: string;
  content: string;
  order: number;
} 