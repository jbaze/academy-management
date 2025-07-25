import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Curriculum } from '../models/curriculum';
import { CurriculumService } from '../services/curriculum';
import { Auth } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { UserRole } from '../../../core/models/role';

@Component({
  selector: 'app-curriculum-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './curriculum-list.html',
  styleUrl: './curriculum-list.scss'
})
export class CurriculumList implements OnInit {
  private curriculumService = inject(CurriculumService);
  private authService = inject(Auth);
  private notificationService = inject(NotificationService);

  curriculums = signal<Curriculum[]>([]);
  loading = signal(false);
  searchControl = new FormControl('');
  filterControl = new FormControl('all');

  currentUser = computed(() => this.authService.getCurrentUser());
  isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);
  isMentor = computed(() => this.currentUser()?.role === UserRole.MENTOR);

  filteredCurriculums = computed(() => {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    const filter = this.filterControl.value || 'all';

    return this.curriculums().filter(curriculum => {
      const matchesSearch = curriculum.name.toLowerCase().includes(searchTerm) ||
                           curriculum.description.toLowerCase().includes(searchTerm) ||
                           curriculum.difficulty.toLowerCase().includes(searchTerm);

      const matchesFilter = filter === 'all' ||
                           (filter === 'active' && curriculum.isActive) ||
                           (filter === 'draft' && !curriculum.isActive) ||
                           (filter === 'approved' && curriculum.approvedBy) ||
                           (filter === 'pending' && !curriculum.approvedBy) ||
                           (filter === curriculum.difficulty);

      return matchesSearch && matchesFilter;
    });
  });

  ngOnInit(): void {
    this.loadCurriculums();
  }

  private loadCurriculums(): void {
    this.loading.set(true);
    this.curriculumService.getCurriculums().subscribe({
      next: (curriculums) => {
        this.curriculums.set(curriculums);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load curriculums');
        this.loading.set(false);
      }
    });
  }

  duplicateCurriculum(curriculum: Curriculum): void {
    this.curriculumService.duplicateCurriculum(curriculum.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Curriculum duplicated successfully');
        this.loadCurriculums();
      },
      error: () => {
        this.notificationService.showError('Failed to duplicate curriculum');
      }
    });
  }

  approveCurriculum(curriculum: Curriculum): void {
    const currentUser = this.currentUser();
    if (!currentUser || !this.isAdmin()) return;

    this.curriculumService.approveCurriculum(curriculum.id, currentUser.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Curriculum approved successfully');
        this.loadCurriculums();
      },
      error: () => {
        this.notificationService.showError('Failed to approve curriculum');
      }
    });
  }

  deleteCurriculum(curriculum: Curriculum): void {
    if (confirm(`Are you sure you want to delete "${curriculum.name}"?`)) {
      this.curriculumService.deleteCurriculum(curriculum.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Curriculum deleted successfully');
          this.loadCurriculums();
        },
        error: () => {
          this.notificationService.showError('Failed to delete curriculum');
        }
      });
    }
  }

  exportCurriculum(curriculum: Curriculum): void {
    this.curriculumService.exportCurriculum(curriculum.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${curriculum.name.replace(/\s+/g, '_')}_curriculum.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.notificationService.showSuccess('Curriculum exported successfully');
      },
      error: () => {
        this.notificationService.showError('Failed to export curriculum');
      }
    });
  }

  onFileImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.curriculumService.importCurriculum(file).subscribe({
        next: () => {
          this.notificationService.showSuccess('Curriculum imported successfully');
          this.loadCurriculums();
        },
        error: (error) => {
          this.notificationService.showError(`Failed to import curriculum: ${error}`);
        }
      });
    }
  }

  getDifficultyBadgeClass(difficulty: string): string {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusBadgeClass(curriculum: Curriculum): string {
    if (curriculum.approvedBy) {
      return 'bg-green-100 text-green-800';
    }
    if (curriculum.isActive) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  }

  getStatusText(curriculum: Curriculum): string {
    if (curriculum.approvedBy) {
      return 'Approved';
    }
    if (curriculum.isActive) {
      return 'Active';
    }
    return 'Draft';
  }

  trackByCurriculumId(index: number, curriculum: Curriculum): string {
    return curriculum.id;
  }
}
