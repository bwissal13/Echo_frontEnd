import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Location } from '@angular/common';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <button mat-icon-button class="back-button" (click)="goBack()">
      <mat-icon>arrow_back</mat-icon>
    </button>
  `,
  styles: [`
    .back-button {
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      width: 40px;
      height: 40px;
      border-radius: 12px;
      
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #1a1a1a;
      }
      
      &:hover {
        background: #f8f9fa;
      }
    }
  `]
})
export class BackButtonComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
} 