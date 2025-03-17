import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit {
  private isExpandedSubject = new BehaviorSubject<boolean>(true);
  isExpanded$ = this.isExpandedSubject.asObservable();
  isAuthenticated$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.isAuthenticated$ = this.authService.getAuthState().pipe(
      map(state => state.isAuthenticated)
    );
  }

  ngOnInit() {
    // Subscribe to auth state changes if needed
    this.authService.getAuthState().subscribe(state => {
      console.log('Auth state:', state);
    });
  }

  toggleSidebar() {
    this.isExpandedSubject.next(!this.isExpandedSubject.value);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  get isAdmin(): boolean {
    const isAdmin = this.authService.hasRole('ADMIN');
    console.log('Is Admin:', isAdmin);
    return isAdmin;
  }
} 