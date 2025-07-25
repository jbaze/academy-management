import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { DashboardService, DashboardStats } from '../services/dashboard';
import { UpcomingClasses } from '../widgets/upcoming-classes/upcoming-classes';
import { RecentActivity } from '../widgets/recent-activity/recent-activity';
import { StatsCard } from '../widgets/stats-card/stats-card';

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StatsCard,
    RecentActivity,
    UpcomingClasses
  ],
  templateUrl: './mentor-dashboard.html',
  styleUrl: './mentor-dashboard.scss'
})
export class MentorDashboard implements OnInit {
  private authService = inject(Auth);
  private dashboardService = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);
  loading = signal(true);
  mentorId = signal<string | null>(null);

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.mentorId.set(user.id);
      this.loadDashboardStats(user.id);
    }
  }

  private loadDashboardStats(mentorId: string): void {
    this.loading.set(true);
    this.dashboardService.getMentorDashboardStats(mentorId).subscribe({
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
    const mentorId = this.mentorId();
    if (mentorId) {
      this.loadDashboardStats(mentorId);
    }
  }
}
