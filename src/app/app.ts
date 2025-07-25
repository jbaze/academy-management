import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { Auth} from './core/services/auth';
import { LoadingSpinner } from './shared/components/loading-spinner/loading-spinner';
import { Toast } from './shared/components/toast/toast';
import { MainLayout } from './shared/layout/main-layout/main-layout';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LoadingSpinner,
    Toast,
    MainLayout
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App{
  private authService = inject(Auth);
  private router = inject(Router);

  title = 'academy-management-system';

  isAuthenticated = computed(() => this.authService.isAuthenticated());

  constructor() {
    // Listen to auth state changes
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth && !this.isAuthRoute()) {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  private isAuthRoute(): boolean {
    return this.router.url.startsWith('/auth');
  }
}
