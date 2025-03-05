import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth/services/auth.service';
import { SidebarComponent } from '../shared/components/sidebar/sidebar.component';
import { SearchBarComponent } from '../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    SidebarComponent,
    SearchBarComponent
  ],
  template: `
    <div class="app-container">
      <app-sidebar></app-sidebar>

      <div class="main-content">
          <app-search-bar></app-search-bar>
      

        <div class="current-book">
          <div class="book-info">
            <h1>Happy reading, Harvey</h1>
            <p>Wow! you've delved deep into the wizarding world's secrets.</p>
            <p>How Harry's parents died yet? Oops, looks like you're not there yet. Get reading now!</p>
            <button>Start reading →</button>
          </div>
          <div class="book-preview">
            <img src="assets/books/current-book.jpg" alt="Current Book">
          </div>
        </div>

        <div class="content-grid">
          <div class="left-column">
            <div class="section">
              <div class="section-header">
                <h2>Popular Now</h2>
                <button class="more-btn">••</button>
              </div>
              <div class="book-grid">
                <div class="book-card" *ngFor="let book of popularBooks">
                  <img [src]="book.coverImage" [alt]="book.title">
                  <p class="book-title">{{ book.title }}</p>
                </div>
              </div>
            </div>

            
          </div>

          <div class="right-column">
            <div class="section schedule-section">
              <div class="section-header">
                <h2>Schedule Reading</h2>
                <div class="nav-buttons">
                  <button><mat-icon>chevron_left</mat-icon></button>
                  <button><mat-icon>chevron_right</mat-icon></button>
                </div>
              </div>
              <div class="calendar">
                <div class="calendar-header">
                  <span *ngFor="let day of weekDays">{{ day }}</span>
                </div>
                <div class="calendar-days">
                  <div class="day" *ngFor="let date of calendarDates" 
                       [class.active]="date.isActive">
                    {{ date.day }}
                  </div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-header">
                <h2>Reader Friends</h2>
                <button class="more-btn">••</button>
              </div>
              <div class="friends-list">
                <div class="friend" *ngFor="let friend of readerFriends">
                  <img [src]="friend.avatar" [alt]="friend.name">
                  <div class="friend-info">
                    <p class="friend-name">{{ friend.name }}</p>
                    <p class="friend-status">{{ friend.lastActivity }}</p>
                    <p class="chapter-info">← Chapter Five: Dragon Alley <span class="time">{{ friend.timeAgo }}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      background: #ffffff;
      display: grid;
      grid-template-columns: auto 1fr;
      min-height: 100vh;
    }

    .main-content {
      display: flex;
      padding: 32px;
      flex-direction: column;
      gap: 32px;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .current-book {
      background: white;
      border-radius: 12px;
      padding: 40px;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 40px;
      margin-bottom: 32px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #eee;

      .book-info {
        max-width: 520px;

        h1 {
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1a1a1a;
        }

        p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 12px;
          font-size: 16px;
        }

        button {
          background: #2563eb;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          margin-top: 24px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: #1d4ed8;
          }
        }
      }

      .book-preview img {
        width: 280px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease;

        &:hover {
          transform: translateY(-4px);
        }
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 32px;

      .section {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #eee;
      }
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h2 {
        font-size: 18px;
        font-weight: 600;
        color: #1a1a1a;
      }

      .more-btn {
        color: #666;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: background-color 0.2s ease;

        &:hover {
          background-color: #f5f5f5;
        }
      }
    }

    .book-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;

      .book-card {
        transition: transform 0.2s ease;
        cursor: pointer;

        &:hover {
          transform: translateY(-4px);
        }

        img {
          width: 100%;
          aspect-ratio: 3/4;
          object-fit: cover;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .book-title {
          font-size: 14px;
          color: #333;
          margin-top: 12px;
          font-weight: 500;
        }
      }
    }

    .calendar {
      margin-top: 20px;

      .calendar-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        margin-bottom: 16px;

        span {
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }
      }

      .calendar-days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
        text-align: center;

        .day {
          font-size: 14px;
          color: #333;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: #f5f5f5;
          }

          &.active {
            background: #2563eb;
            color: white;
          }
        }
      }
    }

    .friends-list {
      margin-top: 20px;

      .friend {
        display: flex;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        transition: background-color 0.2s ease;
        margin-bottom: 12px;

        &:hover {
          background-color: #f5f5f5;
        }

        img {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: cover;
        }

        .friend-info {
          flex: 1;

          .friend-name {
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 4px;
            color: #1a1a1a;
          }

          .friend-status {
            font-size: 13px;
            line-height: 1.5;
            color: #666;
            margin-bottom: 4px;
          }

          .chapter-info {
            font-size: 12px;
            color: #2563eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 500;

            .time {
              color: #666;
            }
          }
        }
      }
    }

    .search-bar {
      display: flex;
      align-items: center;
      background: white;
      padding: 12px 20px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);

      input {
        flex: 1;
        border: none;
        margin: 0 15px;
        font-size: 16px;
        &:focus {
          outline: none;
        }
      }

      .user-profile {
        display: flex;
        align-items: center;
        gap: 15px;

        img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
      }
    }

    @media (max-width: 1400px) {
      .main-content {
        padding: 32px;
      }

      .current-book {
        padding: 40px;
        gap: 40px;
      }
    }

    @media (max-width: 992px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .current-book {
        grid-template-columns: 1fr;
        text-align: center;
        padding: 32px;

        .book-info {
          margin: 0 auto;
        }

        .book-preview img {
          width: 280px;
          margin: 0 auto;
        }
      }

      .book-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  popularBooks = [
    {
      title: 'The World of Ice and Fire',
      coverImage: 'assets/books/ice-and-fire.jpg'
    },
    {
      title: 'Fantastic Beasts Volume II',
      coverImage: 'assets/books/fantastic-beasts.jpg'
    },
    {
      title: 'Game of Thrones Volume III',
      coverImage: 'assets/books/got.jpg'
    },
    {
      title: 'Fear',
      coverImage: 'assets/books/fear.jpg'
    }
  ];

  currentSeries = {
    title: 'A Legend of Ice and Fire: The Ice Horse',
    volumes: 2,
    chaptersPerVol: '8 chapters each vol',
    covers: ['assets/books/ice-horse-1.jpg', 'assets/books/ice-horse-2.jpg']
  };

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  calendarDates = Array.from({length: 7}, (_, i) => ({
    day: i + 11,
    isActive: i + 11 === 15
  }));

  readerFriends = [
    {
      name: 'Roberto Jordan',
      avatar: 'assets/avatars/roberto.jpg',
      lastActivity: 'What a delightful and magical chapter it is indeed transports readers to the wizarding world.',
      timeAgo: '2 mins ago'
    },
    {
      name: 'Anna Henry',
      avatar: 'assets/avatars/anna.jpg',
      lastActivity: 'I finished reading the chapter last night and',
      timeAgo: '5 mins ago'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  ngOnInit(): void {
    // Component initialization logic can go here
  }
} 