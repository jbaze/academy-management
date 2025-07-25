// ===== SOLUTION: Update course-curriculum to bridge to new curriculum system =====

// src/app/features/courses/course-curriculum/course-curriculum.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Curriculum } from '../../curriculum/models/curriculum';
import { CurriculumService } from '../../curriculum/services/curriculum';
import { CourseService } from '../services/course';
import { Auth} from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { Course } from '../models/course';
import { UserRole } from '../../../core/models/role';

@Component({
  selector: 'app-course-curriculum',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './course-curriculum.html',
  styleUrl: './course-curriculum.scss'
})
export class CourseCurriculum implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private curriculumService = inject(CurriculumService);
  private courseService = inject(CourseService);
  private authService = inject(Auth);
  private notificationService = inject(NotificationService);

  course = signal<Course | null>(null);
  curriculums = signal<Curriculum[]>([]);
  loading = signal(false);
  searchControl = new FormControl('');

  currentUser = computed(() => this.authService.getCurrentUser());
  isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);
  isMentor = computed(() => this.currentUser()?.role === UserRole.MENTOR);
  canCreateCurriculum = computed(() => this.isAdmin() || this.isMentor());

  filteredCurriculums = computed(() => {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    return this.curriculums().filter(curriculum =>
      curriculum.name.toLowerCase().includes(searchTerm) ||
      curriculum.description.toLowerCase().includes(searchTerm) ||
      curriculum.difficulty.toLowerCase().includes(searchTerm)
    );
  });

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourse(courseId);
      this.loadCourseCurriculums(courseId);
    }
  }

  private loadCourse(courseId: string): void {
    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        if (course) {
          this.course.set(course);
        }
      },
      error: () => {
        this.notificationService.showError('Failed to load course');
      }
    });
  }

  private loadCourseCurriculums(courseId: string): void {
    this.loading.set(true);
    this.curriculumService.getCurriculumsByCourse(courseId).subscribe({
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

  createNewCurriculum(): void {
    const courseId = this.course()?.id;
    if (courseId) {
      this.router.navigate(['/curriculum/new'], {
        queryParams: { courseId: courseId }
      });
    }
  }

  viewCurriculumDetail(curriculumId: string): void {
    this.router.navigate(['/curriculum', curriculumId]);
  }

  editCurriculum(curriculumId: string): void {
    this.router.navigate(['/curriculum', curriculumId, 'edit']);
  }

  duplicateCurriculum(curriculum: Curriculum): void {
    this.curriculumService.duplicateCurriculum(curriculum.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Curriculum duplicated successfully');
        this.loadCourseCurriculums(this.course()!.id);
      },
      error: () => {
        this.notificationService.showError('Failed to duplicate curriculum');
      }
    });
  }

  deleteCurriculum(curriculum: Curriculum): void {
    if (confirm(`Are you sure you want to delete "${curriculum.name}"?`)) {
      this.curriculumService.deleteCurriculum(curriculum.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Curriculum deleted successfully');
          this.loadCourseCurriculums(this.course()!.id);
        },
        error: () => {
          this.notificationService.showError('Failed to delete curriculum');
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
