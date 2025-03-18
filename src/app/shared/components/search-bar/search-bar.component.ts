import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { Genre } from '../../../books/models/book.interface';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatBadgeModule
  ],
  template: `
    <div class="search-container" [class.has-active-filters]="hasActiveFilters()">
      <!-- Main search input -->
      <div class="search-input-area">
        <div class="search-icon">
          <mat-icon [class.searching]="isSearching">search</mat-icon>
        </div>
        
        <input 
          type="text" 
          class="search-input"
          placeholder="Search by title, author, genre..."
          [(ngModel)]="searchValue"
          (ngModelChange)="onInputChange()"
        >
        
        <div class="search-actions">
          <button 
            *ngIf="searchValue" 
            class="clear-btn" 
            (click)="clearSearch()"
            aria-label="Clear search"
          >
            <mat-icon>close</mat-icon>
          </button>
          
          <button 
            class="filter-btn" 
            [class.active]="activeFilterCount > 0"
            [matBadge]="activeFilterCount || null"
            matBadgeSize="small"
            matBadgeColor="accent"
            (click)="toggleFilters()"
            aria-label="Toggle filters"
          >
            <mat-icon>filter_list</mat-icon>
          </button>
        </div>
      </div>
      
      <!-- Filters section -->
      <div class="filter-section" *ngIf="showFilters" [@slideInOut]>
        <div class="filter-row">
          <div class="filter-group">
            <label for="genre-select">Genre</label>
            <select 
              id="genre-select"
              class="filter-select"
              [(ngModel)]="genreValue" 
              (change)="applyFilters()"
            >
              <option value="">All Genres</option>
              <option *ngFor="let genre of genres" [value]="genre">
                {{ formatGenre(genre) }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="author-input">Author</label>
            <div class="input-with-clear">
              <input 
                id="author-input"
                type="text" 
                class="filter-input"
                placeholder="Search by author name"
                [(ngModel)]="authorValue"
                (ngModelChange)="applyFilters()"
              >
              <button 
                *ngIf="authorValue" 
                class="clear-filter-btn"
                (click)="clearAuthor()"
                aria-label="Clear author filter"
              >
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
        </div>
        
        <div class="filter-actions">
          <div class="active-filters" *ngIf="hasActiveFilters()">
            <div class="chip" *ngIf="genreValue">
              <span>{{ formatGenre(genreValue) }}</span>
              <button (click)="clearGenre()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="chip" *ngIf="authorValue">
              <span>{{ authorValue }}</span>
              <button (click)="clearAuthor()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>
          
          <button 
            class="reset-btn"
            *ngIf="hasActiveFilters()"
            (click)="resetAllFilters()"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      width: 100%;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      overflow: hidden;
      transition: box-shadow 0.3s ease;
    }
    
    .search-container.has-active-filters {
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    }
    
    .search-input-area {
      display: flex;
      align-items: center;
      padding: 0 16px;
      height: 56px;
    }
    
    .search-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }
    
    .search-icon mat-icon {
      color: #666;
      transition: color 0.3s ease;
    }
    
    .search-icon mat-icon.searching {
      color: #2563eb;
    }
    
    .search-input {
      flex: 1;
      border: none;
      height: 100%;
      font-size: 16px;
      color: #333;
      background: transparent;
      outline: none;
    }
    
    .search-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .clear-btn, .filter-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .clear-btn:hover, .filter-btn:hover {
      background-color: rgba(0,0,0,0.05);
    }
    
    .filter-btn.active {
      color: #2563eb;
    }
    
    .filter-section {
      padding: 16px;
      border-top: 1px solid #eee;
      background-color: #fafafa;
    }
    
    .filter-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    label {
      font-size: 13px;
      font-weight: 500;
      color: #555;
    }
    
    .filter-select, .filter-input {
      height: 40px;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 0 12px;
      font-size: 14px;
      background-color: white;
      color: #333;
      outline: none;
      transition: all 0.2s ease;
    }
    
    .filter-select:focus, .filter-input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }
    
    .input-with-clear {
      position: relative;
      display: flex;
    }
    
    .input-with-clear .filter-input {
      width: 100%;
      padding-right: 36px;
    }
    
    .clear-filter-btn {
      position: absolute;
      right: 0;
      top: 0;
      height: 40px;
      width: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      cursor: pointer;
    }
    
    .clear-filter-btn mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #666;
    }
    
    .filter-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .active-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .chip {
      display: flex;
      align-items: center;
      background: rgba(37, 99, 235, 0.1);
      color: #2563eb;
      border-radius: 16px;
      padding: 4px 8px 4px 12px;
      font-size: 13px;
      gap: 4px;
    }
    
    .chip button {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 2px;
    }
    
    .chip mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    
    .reset-btn {
      background-color: transparent;
      color: #ef4444;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .reset-btn:hover {
      background-color: rgba(239, 68, 68, 0.1);
    }
    
    @media (max-width: 768px) {
      .filter-row {
        grid-template-columns: 1fr;
      }
    }
  `],
  animations: [
    // Add a simple slide animation for the filters panel
    // You'll need to import the animations module if you use this
    // trigger('slideInOut', [
    //   transition(':enter', [
    //     style({ opacity: 0, height: 0 }),
    //     animate('200ms ease-out', style({ opacity: 1, height: '*' }))
    //   ]),
    //   transition(':leave', [
    //     animate('200ms ease-in', style({ opacity: 0, height: 0 }))
    //   ])
    // ])
  ]
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Output() search = new EventEmitter<any>();
  
  searchValue: string = '';
  genreValue: string = '';
  authorValue: string = '';
  showFilters: boolean = false;
  isSearching: boolean = false;
  
  // Genre options from the Genre enum
  genres: string[] = Object.values(Genre);
  
  private searchSubject = new Subject<void>();
  private destroy$ = new Subject<void>();
  
  get activeFilterCount(): number {
    let count = 0;
    if (this.genreValue) count++;
    if (this.authorValue) count++;
    return count;
  }
  
  ngOnInit(): void {
    // Set up debounced search
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.emitSearch();
      this.isSearching = false;
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }
  
  onInputChange(): void {
    this.isSearching = true;
    this.searchSubject.next();
  }
  
  applyFilters(): void {
    console.log('Applying genre filter:', this.genreValue);
    
    // Only emit if we have at least one filter active
    if (this.hasActiveFilters()) {
      this.search.emit({
        query: this.searchValue,
        genre: this.genreValue, // This should be the exact enum value
        authorName: this.authorValue
      });
    } else {
      // Reset if no filters are active
      this.resetAllFilters();
    }
  }
  
  clearSearch(): void {
    this.searchValue = '';
    this.searchSubject.next();
  }
  
  clearGenre(): void {
    this.genreValue = '';
    this.applyFilters();
  }
  
  clearAuthor(): void {
    this.authorValue = '';
    this.applyFilters();
  }
  
  resetAllFilters(): void {
    this.searchValue = '';
    this.genreValue = '';
    this.authorValue = '';
    this.search.emit('');
  }
  
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  
  hasActiveFilters(): boolean {
    return !!(this.searchValue || this.genreValue || this.authorValue);
  }
  
  formatGenre(genre: string): string {
    return genre
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.toLowerCase().slice(1))
      .join(' ');
  }
  
  private emitSearch(): void {
    this.search.emit({
      query: this.searchValue,
      genre: this.genreValue,
      authorName: this.authorValue
    });
  }
} 