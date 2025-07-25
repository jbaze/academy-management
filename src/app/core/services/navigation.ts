import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private router = inject(Router);
  private breadcrumbSubject = new BehaviorSubject<string[]>([]);

  breadcrumb$ = this.breadcrumbSubject.asObservable();

  setBreadcrumb(items: string[]): void {
    this.breadcrumbSubject.next(items);
  }

  navigateToUserDashboard(role: string): void {
    const roleRoutes = {
      admin: '/dashboard/admin',
      mentor: '/dashboard/mentor',
      parent: '/dashboard/parent'
    };

    const route = roleRoutes[role as keyof typeof roleRoutes] || '/dashboard';
    this.router.navigate([route]);
  }

  goBack(): void {
    window.history.back();
  }

  navigateWithParams(route: string, params: any = {}): void {
    this.router.navigate([route], { queryParams: params });
  }
}
