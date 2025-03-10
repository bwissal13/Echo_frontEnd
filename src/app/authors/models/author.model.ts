export interface Author {
  id: number;
  firstname: string;
  lastname: string;
  profilePicture?: string;
  totalBooks: number;
  totalFollowers: number;
  isFollowing?: boolean;
  books?: {
    id: number;
    title: string;
    publishedAt: string;
    coverImage: string;
  }[];
}

export interface AuthorsResponse {
  content: Author[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Book {
  id: string;
  title: string;
  coverImage: string;
  publishedYear: number;
} 