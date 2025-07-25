import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Classroom } from '../models/classroom';
import { ClassroomService } from '../services/classroom';
import { NotificationService } from '../../../core/services/notification';
import { Auth } from '../../../core/services/auth';
import { UserRole } from '../../../core/models/role';

@Component({
  selector: 'app-classroom-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './classroom-list.html',
  styleUrl: './classroom-list.scss'
})
export class ClassroomList implements OnInit {
  private classroomService = inject(ClassroomService);
  private notificationService = inject(NotificationService);
  private authService = inject(Auth);

  classrooms = signal<Classroom[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  filterActive = signal<boolean | null>(null);

  ngOnInit(): void {
    this.loadClassrooms();
  }

  private loadClassrooms(): void {
    this.isLoading.set(true);
    this.classroomService.getClassrooms().subscribe({
      next: (classrooms) => {
        this.classrooms.set(classrooms);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load classrooms');
        this.isLoading.set(false);
      }
    });
  }

  filteredClassrooms() {
    let filtered = this.classrooms();

    // Search filter
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(classroom =>
        classroom.name.toLowerCase().includes(search) ||
        classroom.location.toLowerCase().includes(search) ||
        classroom.equipment.some(eq => eq.toLowerCase().includes(search))
      );
    }

    // Active filter
    if (this.filterActive() !== null) {
      filtered = filtered.filter(classroom => classroom.isActive === this.filterActive());
    }

    return filtered;
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
  }

  onFilterActive(active: boolean | null): void {
    this.filterActive.set(active);
  }

  toggleClassroomStatus(classroom: Classroom): void {
    const newStatus = !classroom.isActive;
    this.classroomService.updateClassroom(classroom.id, { isActive: newStatus }).subscribe({
      next: () => {
        classroom.isActive = newStatus;
        this.notificationService.showSuccess(
          `Classroom ${newStatus ? 'activated' : 'deactivated'} successfully`
        );
      },
      error: () => {
        this.notificationService.showError('Failed to update classroom status');
      }
    });
  }

  deleteClassroom(classroom: Classroom): void {
    if (confirm(`Are you sure you want to delete ${classroom.name}?`)) {
      this.classroomService.deleteClassroom(classroom.id).subscribe({
        next: () => {
          this.classrooms.update(classrooms =>
            classrooms.filter(c => c.id !== classroom.id)
          );
          this.notificationService.showSuccess('Classroom deleted successfully');
        },
        error: () => {
          this.notificationService.showError('Failed to delete classroom');
        }
      });
    }
  }

  canEdit(): boolean {
    return this.authService.hasAnyRole([UserRole.ADMIN]);
  }

  canDelete(): boolean {
    return this.authService.hasRole(UserRole.ADMIN);
  }
}
