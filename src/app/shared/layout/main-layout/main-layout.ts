import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { Auth} from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { Loading} from '../../../core/services/loading';
import { Header} from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { User } from '../../../core/models/user';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import { Toast} from '../../components/toast/toast';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    Header,
    Sidebar,
    Footer,
    LoadingSpinner,
    Toast
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout implements OnInit {
  private authService = inject(Auth);
  private notificationService = inject(NotificationService);
  private loadingService = inject(Loading);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  sidebarOpen = signal(false);
  loading = computed(() => this.loadingService.loading$);

  ngOnInit(): void {
    // Subscribe to auth state
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  onLogout(): void {
    this.authService.logout();
    this.notificationService.showSuccess('Logged out successfully');
    this.router.navigate(['/auth/login']);
  }
}
