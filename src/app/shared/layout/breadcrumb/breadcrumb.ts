import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs';

interface BreadcrumbItem {
  label: string;
  url: string;
  isActive: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss'
})
export class Breadcrumb implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  breadcrumbs: BreadcrumbItem[] = [];

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.buildBreadcrumb(this.activatedRoute.root))
      )
      .subscribe(breadcrumbs => {
        this.breadcrumbs = breadcrumbs;
      });
  }

  private buildBreadcrumb(route: ActivatedRoute, url: string = '', breadcrumbs: BreadcrumbItem[] = []): BreadcrumbItem[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'] || this.getRouteLabel(routeURL);
      if (label) {
        breadcrumbs.push({
          label,
          url,
          isActive: false
        });
      }

      return this.buildBreadcrumb(child, url, breadcrumbs);
    }

    // Mark the last item as active
    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].isActive = true;
    }

    return breadcrumbs;
  }

  private getRouteLabel(route: string): string {
    const labelMap: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'students': 'Students',
      'mentors': 'Mentors',
      'courses': 'Courses',
      'classrooms': 'Classrooms',
      'scheduling': 'Scheduling',
      'billing': 'Billing',
      'reports': 'Reports',
      'settings': 'Settings',
      'profile': 'Profile',
      'new': 'Add New',
      'edit': 'Edit',
      'list': 'List',
      'detail': 'Details'
    };
    return labelMap[route] || route.charAt(0).toUpperCase() + route.slice(1);
  }
}
