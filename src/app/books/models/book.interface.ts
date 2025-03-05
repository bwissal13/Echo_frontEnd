export interface Book {
  id: number;
  title: string;
  author?: string;
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
  coverImage?: string | null;
  chapters?: Chapter[];
}

export interface UpdateBookRequest {
  title?: string;
  description?: string;
  genre?: Genre;
  isPublic?: boolean;
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
  bookId: number;
  title: string;
  content: string;
  order: number;
  updatedAt?: Date;
  deletedAt?: Date;
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

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
} 