import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Mentor } from '../models/mentor';
import { MentorService } from '../services/mentor';
import { UserService } from '../../../core/services/user';
import { CourseService } from '../../courses/services/course';
import { Auth } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { User } from '../../../core/models/user';
import { Course } from '../../courses/models/course';
import { UserRole } from '../../../core/models/role';

@Component({
  selector: 'app-mentor-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mentor-detail.html',
  styleUrl: './mentor-detail.scss'
})
export class MentorDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private mentorService = inject(MentorService);
  private userService = inject(UserService);
  private courseService = inject(CourseService);
  private authService = inject(Auth);
  private notificationService = inject(NotificationService);

  mentor = signal<Mentor | null>(null);
  mentorUser = signal<User | null>(null);
  assignedCourses = signal<Course[]>([]);
  loading = signal(false);

  currentUser = computed(() => this.authService.getCurrentUser());
  canEdit = computed(() => {
    const user = this.currentUser();
    return user?.role === UserRole.ADMIN ||
           (user?.role === UserRole.MENTOR && user.id === this.mentorUser()?.id);
  });

  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  ngOnInit(): void {
    const mentorId = this.route.snapshot.paramMap.get('id');
    if (mentorId) {
      this.loadMentor(mentorId);
    }
  }

  private loadMentor(id: string): void {
    this.loading.set(true);

    this.mentorService.getMentorById(id).subscribe({
      next: (mentor) => {
        if (mentor) {
          this.mentor.set(mentor);
          this.loadMentorUser(mentor.userId);
          this.loadAssignedCourses(mentor.assignedCourses);
        }
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load mentor');
        this.loading.set(false);
      }
    });
  }

  private loadMentorUser(userId: string): void {
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        if (user) {
          this.mentorUser.set(user);
        }
      },
      error: () => {
        console.error('Failed to load mentor user information');
      }
    });
  }

  private loadAssignedCourses(courseIds: string[]): void {
    if (courseIds.length === 0) {
      this.assignedCourses.set([]);
      return;
    }

    this.courseService.getCourses().subscribe({
      next: (allCourses) => {
        const assigned = allCourses.filter(course => courseIds.includes(course.id));
        this.assignedCourses.set(assigned);
      },
      error: () => {
        console.error('Failed to load assigned courses');
      }
    });
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive
      ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
  }

  getExperienceBadgeClass(years: number): string {
    if (years >= 5) return 'bg-purple-100 text-purple-800';
    if (years >= 3) return 'bg-blue-100 text-blue-800';
    if (years >= 1) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }
}
