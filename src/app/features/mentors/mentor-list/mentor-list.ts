import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Mentor } from '../models/mentor';
import { MentorService } from '../services/mentor';
import { UserService } from '../../../core/services/user';
import { Auth} from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { User } from '../../../core/models/user';
import { UserRole } from '../../../core/models/role';

@Component({
  selector: 'app-mentor-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './mentor-list.html',
  styleUrl: './mentor-list.scss'
})
export class MentorList implements OnInit {
  private mentorService = inject(MentorService);
  private userService = inject(UserService);
  private authService = inject(Auth);
  private notificationService = inject(NotificationService);

  mentors = signal<Mentor[]>([]);
  mentorUsers = signal<{ [key: string]: User }>({});
  loading = signal(false);
  searchControl = new FormControl('');

  currentUser = computed(() => this.authService.getCurrentUser());
  isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);

  filteredMentors = computed(() => {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    return this.mentors().filter(mentor => {
      const user = this.mentorUsers()[mentor.userId];
      return user && (
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        mentor.specialization.some(spec => spec.toLowerCase().includes(searchTerm))
      );
    });
  });

  ngOnInit(): void {
    this.loadMentors();
  }

  private loadMentors(): void {
    this.loading.set(true);

    this.mentorService.getMentors().subscribe({
      next: (mentors) => {
        this.mentors.set(mentors);
        this.loadMentorUsers(mentors);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load mentors');
        this.loading.set(false);
      }
    });
  }

  private loadMentorUsers(mentors: Mentor[]): void {
    const userMap: { [key: string]: User } = {};

    mentors.forEach(mentor => {
      this.userService.getUserById(mentor.userId).subscribe({
        next: (user) => {
          if (user) {
            userMap[mentor.userId] = user;
            this.mentorUsers.set({ ...this.mentorUsers(), ...userMap });
          }
        }
      });
    });
  }

  deleteMentor(mentor: Mentor): void {
    const user = this.mentorUsers()[mentor.userId];
    const name = user ? `${user.firstName} ${user.lastName}` : 'this mentor';

    if (confirm(`Are you sure you want to delete ${name}?`)) {
      this.mentorService.deleteMentor(mentor.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Mentor deleted successfully');
          this.loadMentors();
        },
        error: () => {
          this.notificationService.showError('Failed to delete mentor');
        }
      });
    }
  }

  toggleMentorStatus(mentor: Mentor): void {
    const newStatus = !mentor.isActive;
    this.mentorService.updateMentor(mentor.id, { isActive: newStatus }).subscribe({
      next: () => {
        this.notificationService.showSuccess(
          `Mentor ${newStatus ? 'activated' : 'deactivated'} successfully`
        );
        this.loadMentors();
      },
      error: () => {
        this.notificationService.showError('Failed to update mentor status');
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

  trackByMentorId(index: number, mentor: Mentor): string {
    return mentor.id;
  }
}
