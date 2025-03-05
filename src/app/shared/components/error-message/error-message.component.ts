import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-message text-red-600 p-4 rounded-lg bg-red-50 mb-4">
      {{ message }}
    </div>
  `
})
export class ErrorMessageComponent {
  @Input() message: string = '';
} 