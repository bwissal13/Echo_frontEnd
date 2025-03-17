import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, FormsModule],
  template: `
    <div class="search-bar">
      <mat-icon>search</mat-icon>
      <input 
        type="text" 
        placeholder="Search for books, authors, or genres..."
        [(ngModel)]="searchValue"
        (input)="onSearch($event)"
      >
      <button 
        *ngIf="searchValue" 
        class="clear-button" 
        mat-icon-button 
        (click)="clearSearch()"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .search-bar {
      display: flex;
      align-items: center;
      background: white;
      border-radius: 12px;
      padding: 12px 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      gap: 12px;

      mat-icon {
        color: #666;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 14px;
        color: #333;
        outline: none;
        
        &::placeholder {
          color: #666;
        }
      }
      
      .clear-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        min-width: unset;
        line-height: 24px;
      }
    }
  `]
})
export class SearchBarComponent {
  @Output() search = new EventEmitter<string>();
  
  searchValue: string = '';

  onSearch(event: Event) {
    console.log('Search value:', this.searchValue);
    this.search.emit(this.searchValue);
  }

  clearSearch() {
    this.searchValue = '';
    this.search.emit('');
  }
} 