import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { DashboardService, DashboardStats } from '../services/dashboard';
import { StudentService } from '../../students/services/student';
import { Student } from '../../students/models/student';
import { StatsCard } from '../widgets/stats-card/stats-card';
import { RecentActivity } from '../widgets/recent-activity/recent-activity';
import { UpcomingClasses } from '../widgets/upcoming-classes/upcoming-classes';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StatsCard,
    RecentActivity,
    UpcomingClasses
  ],
  templateUrl: './parent-dashboard.html',
  styleUrl: './parent-dashboard.scss'
})
export class ParentDashboard implements OnInit {
  private authService = inject(Auth);
  private dashboardService = inject(DashboardService);
  private studentService = inject(StudentService);

  stats = signal<DashboardStats | null>(null);
  students = signal<Student[]>([]);
  loading = signal(true);
  parentId = signal<string | null>(null);

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.parentId.set(user.id);
      this.loadDashboardStats(user.id);
      this.loadStudents(user.id);
    }
  }

  private loadDashboardStats(parentId: string): void {
    this.loading.set(true);
    this.dashboardService.getParentDashboardStats(parentId).subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private loadStudents(parentId: string): void {
    this.studentService.getStudentsByParent(parentId).subscribe({
      next: (students) => {
        this.students.set(students);
      },
      error: () => {
        console.error('Failed to load students');
      }
    });
  }

  refreshDashboard(): void {
    const parentId = this.parentId();
    if (parentId) {
      this.loadDashboardStats(parentId);
      this.loadStudents(parentId);
    }
  }

  getAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}
