import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="search-bar">
      <mat-icon>search</mat-icon>
      <input type="text" placeholder="Search for books, authors, or genres...">
    </div>
  `,
  styles: [`
    .search-bar {
      display: flex;
      align-items: center;
      background: #f5f5f5;
      padding: 8px 16px;
      border-radius: 8px;
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
        
        &::placeholder {
          color: #666;
        }
        
        &:focus {
          outline: none;
        }
      }
    }
  `]
})
export class SearchBarComponent {
  @Output() search = new EventEmitter<string>();
  searchValue: string = '';

  onSearch(event: Event): void {
    this.searchValue = (event.target as HTMLInputElement).value;
    this.search.emit(this.searchValue);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.search.emit('');
    const input = document.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.focus();
    }
  }
} 