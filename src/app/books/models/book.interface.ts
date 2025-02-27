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
  FANTASY = 'FANTASY',
  MYSTERY = 'MYSTERY',
  THRILLER = 'THRILLER',
  ROMANCE = 'ROMANCE',
  HORROR = 'HORROR',
  POETRY = 'POETRY',
  DRAMA = 'DRAMA',
  OTHER = 'OTHER'
}

export interface CreateBookRequest {
  title: string;
  description: string;
  genre: Genre;
  isPublic: boolean;
  coverImage?: string;
}

export interface UpdateBookRequest extends CreateBookRequest {}

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