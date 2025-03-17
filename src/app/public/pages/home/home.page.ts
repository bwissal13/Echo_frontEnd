import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="home-container">
      <!-- Clean Hero Section -->
      <section class="hero-section">
        <div class="container">
          <div class="hero-content">
            <h1>This Month</h1>
            <p class="hero-subtitle">
              Discover the best new books and expand your horizons with our carefully curated collection.
            </p>
            <button class="btn-primary" (click)="navigateTo('/books')">
              Read More
            </button>
          </div>
          <div class="featured-books">
            <div class="book-card" *ngFor="let book of featuredBooks" (click)="navigateTo('/books/' + book.id)">
              <img [src]="book.coverImage" [alt]="book.title" (error)="onImageError($event)">
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="how-it-works">
        <div class="container">
          <h2 class="section-title">How Echo Works</h2>
          
          <div class="steps-container">
            <div class="step-item">
              <div class="step-icon">
                <mat-icon>search</mat-icon>
              </div>
              <h3>1. Discover</h3>
              <p>Browse our extensive collection of free books across all genres</p>
            </div>
            
            <div class="step-item">
              <div class="step-icon">
                <mat-icon>menu_book</mat-icon>
              </div>
              <h3>2. Read</h3>
              <p>Enjoy reading your favorite books anytime, anywhere</p>
            </div>
            
            <div class="step-item">
              <div class="step-icon">
                <mat-icon>people</mat-icon>
              </div>
              <h3>3. Connect</h3>
              <p>Follow your favorite authors and discover new recommendations</p>
            </div>
            
            <div class="step-item">
              <div class="step-icon">
                <mat-icon>bookmark</mat-icon>
              </div>
              <h3>4. Build Your Library</h3>
              <p>Save favorites to your personal collection</p>
            </div>
          </div>
        </div>
      </section>

      <!-- New Released Books -->
      <section class="books-section">
        <div class="container">
          <div class="section-header">
            <h2>New Released Books</h2>
            <p>The latest additions to our ever-growing library of quality content</p>
          </div>
          
          <div class="books-grid">
            <div class="book-item" *ngFor="let book of newReleases" (click)="navigateTo('/books/' + book.id)">
              <div class="book-cover">
                <img [src]="book.coverImage" [alt]="book.title" (error)="onImageError($event)">
              </div>
              <div class="book-info">
                <h3>{{ book.title }}</h3>
                <p class="author">by {{ book.author }}</p>
          
              </div>
            </div>
          </div>
          <div class="view-all">
            <a (click)="navigateTo('/books')">View All <mat-icon>arrow_forward</mat-icon></a>
          </div>
        </div>
      </section>

      <!-- Quote Section -->
      <section class="quote-section">
        <div class="container">
          <blockquote>
            "The more that you read, the more things you will know. The more that you learn, the more places you'll go."
          </blockquote>
        </div>
      </section>

      <!-- Bestselling Books -->
      <section class="books-section bestsellers">
        <div class="container">
          <div class="section-header">
            <h2>Bestselling Books</h2>
            <p>Our most popular books that readers are enjoying right now</p>
          </div>
          
          <div class="books-grid">
            <div class="book-item" *ngFor="let book of bestsellers" (click)="navigateTo('/books/' + book.id)">
              <div class="book-cover">
                <img [src]="book.coverImage" [alt]="book.title" (error)="onImageError($event)">
              </div>
              <div class="book-info">
                <h3>{{ book.title }}</h3>
                <p class="author">by {{ book.author }}</p>
              </div>
            </div>
          </div>
          <div class="view-all">
            <a (click)="navigateTo('/books')">View All <mat-icon>arrow_forward</mat-icon></a>
          </div>
        </div>
      </section>

      <!-- Flash Sale -->
      <section class="flash-sale">
        <div class="container">
          <div class="section-header">
            <h2>Featured Collection</h2>
            <p>Special collections available for a limited time:</p>
            <div class="countdown-timer">
              <div class="timer-box">05</div>
              <div class="timer-box">03</div>
              <div class="timer-box">25</div>
              <div class="timer-box">59</div>
            </div>
          </div>
          
          <div class="sale-items">
            <div class="sale-item">
              <div class="item-image">
                <img src="assets/images/book-sale-1.jpg" alt="Featured collection" (error)="onImageError($event)">
              </div>
              <div class="item-details">
                <h3>Robin: Take a Complete Biography</h3>
                <p class="description">An in-depth look at the life and career of one of the most influential figures of our time.</p>
                <div class="feature-tag">
                  <span>FEATURED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Favorite Authors -->
      <section class="authors-section">
        <div class="container">
          <div class="section-header">
            <h2>Favorite Authors</h2>
            <p>Explore works from our most celebrated writers</p>
          </div>
          
          <div class="authors-grid">
            <div class="author-item" *ngFor="let author of authors" (click)="navigateTo('/authors/' + author.id)">
              <div class="author-avatar">
                <img [src]="author.image" [alt]="author.name" (error)="onImageError($event)">
              </div>
              <h3>{{author.name}}</h3>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter -->
      <section class="newsletter">
        <div class="container">
          <h2>Subscribe to our newsletter for newest books updates</h2>
          <div class="subscription-form">
            <input type="email" placeholder="Type your email here">
            <button class="btn-primary">Subscribe</button>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer>
        <div class="container">
          <div class="footer-content">
            <div class="brand">
              <h3>Echo</h3>
              <p>Where reading and writing converge to create knowledge worth sharing.</p>
              <div class="social-icons">
                <a href="#"><mat-icon>facebook</mat-icon></a>
                <a href="#"><mat-icon>twitter</mat-icon></a>
                <a href="#"><mat-icon>instagram</mat-icon></a>
              </div>
            </div>
            
            <div class="footer-links">
              <div class="link-group">
                <h4>About</h4>
                <a href="#">About Us</a>
                <a href="#">Features</a>
                <a href="#">News</a>
                <a href="#">Careers</a>
              </div>
              
              <div class="link-group">
                <h4>Services</h4>
                <a href="#">Library</a>
                <a href="#">Authors</a>
                <a href="#">Books</a>
                <a href="#">Services</a>
              </div>
              
              <div class="link-group">
                <h4>Help</h4>
                <a href="#">How to Read</a>
                <a href="#">Contact Us</a>
                <a href="#">FAQs</a>
              </div>
              
              <div class="link-group">
                <h4>Policies</h4>
                <a href="#">Terms & Conditions</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Copyright Policy</a>
              </div>
            </div>
          </div>
          
          <div class="copyright">
            <p>&copy; 2023 Echo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    /* Base Styles */
    :host {
      --primary-color: #9d8aa5;
      --primary-light: #b7a6be;
      --primary-dark: #7c6d85;
      --secondary-color: #111827;
      --background-color: #f8f9fa;
      --surface-color: #ffffff;
      --text-primary: #1a1a1a;
      --text-secondary: #6b7280;
      --border-color: #e5e7eb;
      
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--text-primary);
    }

    /* Add this to make button text white */
    ::ng-deep .mdc-button__label {
      color: white;
    }

    .home-container {
      background-color: var(--background-color);
      overflow-x: hidden;
    }

    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Hero Section */
    .hero-section {
      background-color: var(--surface-color);
      padding: 4rem 0;
      border-bottom: 1px solid var(--border-color);
    }

    .hero-section .container {
      display: flex;
      align-items: center;
      gap: 3rem;
    }

    .hero-content {
      flex: 1;
    }

    .hero-content h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }

    .hero-subtitle {
      font-size: 1.1rem;
      color: var(--text-secondary);
      margin-bottom: 2rem;
      max-width: 500px;
      line-height: 1.6;
    }

    .btn-primary {
      background-color: var(--primary-color);
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.375rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-primary:hover {
      background-color: var(--primary-dark);
    }

    .featured-books {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .book-card {
      position: relative;
      height: 250px;
      overflow: hidden;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .book-card:hover {
      transform: translateY(-5px);
    }

    .book-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* How It Works */
    .how-it-works {
      padding: 5rem 0;
      background-color: var(--surface-color);
    }

    .section-title {
      text-align: center;
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 3rem;
      color: var(--text-primary);
    }

    .steps-container {
      display: flex;
      justify-content: space-between;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .step-item {
      flex: 1;
      min-width: 200px;
      text-align: center;
      padding: 1.5rem;
      background-color: var(--surface-color);
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .step-icon {
      width: 60px;
      height: 60px;
      background-color: var(--primary-light);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }

    .step-icon mat-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: white;
    }

    .step-item h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: var(--text-primary);
    }

    .step-item p {
      color: var(--text-secondary);
      line-height: 1.6;
    }

    /* Books Section */
    .books-section {
      padding: 5rem 0;
    }

    .bestsellers {
      background-color: var(--surface-color);
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-header h2 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }

    .section-header p {
      font-size: 1rem;
      color: var(--text-secondary);
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .books-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .book-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .book-item:hover {
      transform: translateY(-5px);
    }

    .book-cover {
      width: 100%;
      height: 280px;
      margin-bottom: 1rem;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .book-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .book-info {
      text-align: center;
      width: 100%;
    }

    .book-info h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }

    .author {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .price {
      color: var(--primary-color);
      font-weight: 600;
    }

    .free-tag {
      display: inline-block;
      background-color: var(--primary-color);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.8rem;
    }

    .view-all {
      text-align: center;
      margin-top: 2rem;
    }

    .view-all a {
      display: inline-flex;
      align-items: center;
      color: var(--primary-color);
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    }

    .view-all a mat-icon {
      font-size: 1.25rem;
      margin-left: 0.5rem;
    }

    /* Quote Section */
    .quote-section {
      background-color: var(--secondary-color);
      padding: 5rem 0;
      color: white;
      text-align: center;
    }

    blockquote {
      font-size: 2rem;
      font-weight: 300;
      line-height: 1.4;
      max-width: 800px;
      margin: 0 auto;
      font-style: italic;
    }

    /* Flash Sale */
    .flash-sale {
      padding: 5rem 0;
      background: linear-gradient(to right, #f3f4f6, #ffffff);
    }

    .countdown-timer {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
      margin-bottom: 3rem;
    }

    .timer-box {
      width: 60px;
      height: 60px;
      background-color: var(--secondary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 600;
      border-radius: 0.375rem;
    }

    .sale-items {
      max-width: 800px;
      margin: 0 auto;
    }

    .sale-item {
      display: flex;
      gap: 2rem;
      background-color: white;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .item-image {
      flex: 0 0 200px;
      height: 200px;
    }

    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-details {
      flex: 1;
      padding: 1.5rem;
    }

    .item-details h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }

    .description {
      color: var(--text-secondary);
      margin-bottom: 1rem;
      line-height: 1.6;
    }

    .feature-tag {
      display: inline-block;
    }

    .feature-tag span {
      background-color: var(--primary-color);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 600;
    }

    /* Authors Section */
    .authors-section {
      padding: 5rem 0;
      background-color: var(--surface-color);
    }

    .authors-grid {
      display: flex;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .author-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .author-item:hover {
      transform: translateY(-5px);
    }

    .author-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      margin-bottom: 1rem;
      border: 3px solid var(--primary-light);
    }

    .author-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .author-item h3 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    /* Newsletter */
    .newsletter {
      padding: 5rem 0;
      background-color: var(--background-color);
      text-align: center;
    }

    .newsletter h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      color: var(--text-primary);
    }

    .subscription-form {
      display: flex;
      max-width: 500px;
      margin: 0 auto;
      gap: 1rem;
    }

    .subscription-form input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 0.375rem;
      font-size: 1rem;
    }

    /* Footer */
    footer {
      background-color: white;
      padding: 4rem 0 2rem;
      border-top: 1px solid var(--border-color);
    }

    .footer-content {
      display: flex;
      gap: 4rem;
      margin-bottom: 3rem;
    }

    .brand {
      flex: 1;
    }

    .brand h3 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--primary-color);
    }

    .brand p {
      color: var(--text-secondary);
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .social-icons {
      display: flex;
      gap: 1rem;
    }

    .social-icons a {
      color: var(--text-secondary);
      transition: color 0.2s;
    }

    .social-icons a:hover {
      color: var(--primary-color);
    }

    .footer-links {
      flex: 2;
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .link-group {
      flex: 1;
      min-width: 140px;
    }

    .link-group h4 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: var(--text-primary);
    }

    .link-group a {
      display: block;
      color: var(--text-secondary);
      margin-bottom: 0.75rem;
      text-decoration: none;
      transition: color 0.2s;
    }

    .link-group a:hover {
      color: var(--primary-color);
    }

    .copyright {
      text-align: center;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    /* Responsive */
    @media (max-width: 992px) {
      .hero-section .container {
        flex-direction: column;
        text-align: center;
      }

      .hero-subtitle {
        margin-left: auto;
        margin-right: auto;
      }

      .btn-primary {
        margin: 0 auto;
      }

      .sale-item {
        flex-direction: column;
      }

      .item-image {
        flex: initial;
        height: 250px;
      }
    }

    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
        gap: 3rem;
      }

      .sale-items {
        padding: 0 1rem;
      }

      .subscription-form {
        flex-direction: column;
        padding: 0 1rem;
      }
    }

    @media (max-width: 576px) {
      .hero-content h1 {
        font-size: 2rem;
      }

      .section-header h2 {
        font-size: 1.5rem;
      }

      blockquote {
        font-size: 1.5rem;
        padding: 0 1rem;
      }

      .countdown-timer {
        gap: 0.5rem;
      }

      .timer-box {
        width: 50px;
        height: 50px;
        font-size: 1.25rem;
      }
    }
  `]
})
export class HomePage {
  featuredBooks = [
    {
      id: '1',
      title: 'Wisdom of Life',
      coverImage: 'assets/images/book-1.jpg'
    },
    {
      id: '2',
      title: 'Atomic Love',
      coverImage: 'assets/images/book-2.jpg'
    },
    {
      id: '3',
      title: 'The Blue Guy',
      coverImage: 'assets/images/book-3.jpg'
    }
  ];

  newReleases = [
    {
      id: '1',
      title: 'Believe in Yourself',
      coverImage: 'assets/images/book-1.jpg',
      author: 'Michael Reed'
    },
    {
      id: '2',
      title: 'The Lighthouse',
      coverImage: 'assets/images/book-2.jpg',
      author: 'Emma Stone'
    },
    {
      id: '3',
      title: 'Thoughts to Inspire',
      coverImage: 'assets/images/book-3.jpg',
      author: 'Jessica Wong'
    },
    {
      id: '4',
      title: 'Frozen',
      coverImage: 'assets/images/book-4.jpg',
      author: 'David Miller'
    },
    {
      id: '5',
      title: 'Believe in Yourself',
      coverImage: 'assets/images/book-5.jpg',
      author: 'Sarah Johnson'
    }
  ];

  bestsellers = [
    {
      id: '6',
      title: 'Never Back Down',
      coverImage: 'assets/images/book-6.jpg',
      author: 'John Smith'
    },
    {
      id: '7',
      title: 'Best Loser Wins',
      coverImage: 'assets/images/book-7.jpg',
      author: 'Robert Chase'
    },
    {
      id: '8',
      title: 'Read All 17',
      coverImage: 'assets/images/book-8.jpg',
      author: 'Laura Chen'
    },
    {
      id: '9',
      title: 'Argentina: CHE GUEVARA',
      coverImage: 'assets/images/book-9.jpg',
      author: 'CHE GUEVARA'
    },
    {
      id: '10',
      title: 'Steve Stork',
      coverImage: 'assets/images/book-10.jpg',
      author: 'Michael Reed'
    }
  ];

  authors = [
    {
      id: '1',
      name: 'Ernest Hemingway',
      image: 'assets/images/author-1.jpg'
    },
    {
      id: '2',
      name: 'Maya Angelou',
      image: 'assets/images/author-2.jpg'
    },
    {
      id: '3',
      name: 'J.K. Rowling',
      image: 'assets/images/author-3.jpg'
    },
    {
      id: '4',
      name: 'Stephen King',
      image: 'assets/images/author-4.jpg'
    },
    {
      id: '5',
      name: 'Haruki Murakami',
      image: 'assets/images/author-5.jpg'
    },
    {
      id: '6',
      name: 'Toni Morrison',
      image: 'assets/images/author-6.jpg'
    },
    {
      id: '7',
      name: 'George R.R. Martin',
      image: 'assets/images/author-7.jpg'
    }
  ];

  constructor(private router: Router) {}

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/default-book-cover.jpg';
  }
} 