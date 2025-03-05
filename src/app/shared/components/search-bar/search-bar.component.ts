import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
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