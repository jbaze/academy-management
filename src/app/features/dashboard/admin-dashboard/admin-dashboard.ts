import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardStats } from '../services/dashboard';
import { StatsCard } from '../widgets/stats-card/stats-card';
import { ChartWidget } from '../widgets/chart-widget/chart-widget';
import { RecentActivity } from '../widgets/recent-activity/recent-activity';
import { UpcomingClasses } from '../widgets/upcoming-classes/upcoming-classes';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StatsCard,
    ChartWidget,
    RecentActivity,
    UpcomingClasses
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  private dashboardService = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  private loadDashboardStats(): void {
    this.loading.set(true);
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  refreshDashboard(): void {
    this.loadDashboardStats();
  }
}
