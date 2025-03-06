// Delete or comment out this entire file as it's conflicting with app-routing.module.ts

{
  path: 'books/public',
  loadComponent: () => import('./books/pages/public-books/public-books.page')
    .then(m => m.PublicBooksPage)
}

{
  path: 'books/public/:id',
  loadComponent: () => import('./books/pages/book-detail/book-detail.page')
    .then(m => m.BookDetailPage)
}

{
  path: 'books/chapter/:chapterId',
  loadComponent: () => import('./books/pages/chapter-read/chapter-read.page')
    .then(m => m.ChapterReadPage)
}
