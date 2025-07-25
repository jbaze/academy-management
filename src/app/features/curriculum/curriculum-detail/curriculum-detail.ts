import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Curriculum, CurriculumModule, Lesson } from '../models/curriculum';
import { CurriculumService } from '../services/curriculum';
import { CourseService } from '../../courses/services/course';
import { Auth } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { Course } from '../../courses/models/course';
import { UserRole } from '../../../core/models/role';

@Component({
  selector: 'app-curriculum-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './curriculum-detail.html',
  styleUrl: './curriculum-detail.scss'
})
export class CurriculumDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private curriculumService = inject(CurriculumService);
  private courseService = inject(CourseService);
  private authService = inject(Auth);
  private notificationService = inject(NotificationService);

  curriculum = signal<Curriculum | null>(null);
  course = signal<Course | null>(null);
  loading = signal(false);
  expandedModules = signal<Set<string>>(new Set());
  expandedLessons = signal<Set<string>>(new Set());

  currentUser = computed(() => this.authService.getCurrentUser());
  canEdit = computed(() => {
    const user = this.currentUser();
    const curriculum = this.curriculum();
    return user?.role === UserRole.ADMIN ||
           (user?.role === UserRole.MENTOR && curriculum?.createdBy === user.id);
  });

  canApprove = computed(() => {
    const user = this.currentUser();
    const curriculum = this.curriculum();
    return user?.role === UserRole.ADMIN && !curriculum?.approvedBy;
  });

  ngOnInit(): void {
    const curriculumId = this.route.snapshot.paramMap.get('id');
    if (curriculumId) {
      this.loadCurriculum(curriculumId);
    }
  }

  private loadCurriculum(id: string): void {
    this.loading.set(true);

    this.curriculumService.getCurriculumById(id).subscribe({
      next: (curriculum) => {
        if (curriculum) {
          this.curriculum.set(curriculum);
          this.loadCourse(curriculum.courseId);
        }
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load curriculum');
        this.loading.set(false);
      }
    });
  }

  private loadCourse(courseId: string): void {
    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        if (course) {
          this.course.set(course);
        }
      },
      error: () => {
        console.error('Failed to load course information');
      }
    });
  }

  toggleModuleExpanded(moduleId: string): void {
    const expanded = this.expandedModules();
    if (expanded.has(moduleId)) {
      expanded.delete(moduleId);
    } else {
      expanded.add(moduleId);
    }
    this.expandedModules.set(new Set(expanded));
  }

  toggleLessonExpanded(lessonId: string): void {
    const expanded = this.expandedLessons();
    if (expanded.has(lessonId)) {
      expanded.delete(lessonId);
    } else {
      expanded.add(lessonId);
    }
    this.expandedLessons.set(new Set(expanded));
  }

  isModuleExpanded(moduleId: string): boolean {
    return this.expandedModules().has(moduleId);
  }

  isLessonExpanded(lessonId: string): boolean {
    return this.expandedLessons().has(lessonId);
  }

  approveCurriculum(): void {
    const currentUser = this.currentUser();
    const curriculum = this.curriculum();

    if (!currentUser || !curriculum || !this.canApprove()) return;

    this.curriculumService.approveCurriculum(curriculum.id, currentUser.id).subscribe({
      next: (updatedCurriculum) => {
        this.curriculum.set(updatedCurriculum);
        this.notificationService.showSuccess('Curriculum approved successfully');
      },
      error: () => {
        this.notificationService.showError('Failed to approve curriculum');
      }
    });
  }

  addModule(): void {
    const curriculum = this.curriculum();
    if (!curriculum) return;

    const newModule: Omit<CurriculumModule, 'id'> = {
      name: 'New Module',
      description: 'Module description',
      order: curriculum.modules.length + 1,
      duration: 1,
      lessons: [],
      objectives: ['Learning objective'],
      resources: [],
      assessments: [],
      isRequired: true
    };

    this.curriculumService.addModuleToCurriculum(curriculum.id, newModule).subscribe({
      next: (updatedCurriculum) => {
        this.curriculum.set(updatedCurriculum);
        this.notificationService.showSuccess('Module added successfully');
      },
      error: () => {
        this.notificationService.showError('Failed to add module');
      }
    });
  }

  deleteModule(moduleId: string): void {
    const curriculum = this.curriculum();
    if (!curriculum) return;

    if (confirm('Are you sure you want to delete this module?')) {
      this.curriculumService.deleteModule(curriculum.id, moduleId).subscribe({
        next: (updatedCurriculum) => {
          this.curriculum.set(updatedCurriculum);
          this.notificationService.showSuccess('Module deleted successfully');
        },
        error: () => {
          this.notificationService.showError('Failed to delete module');
        }
      });
    }
  }

  addLesson(moduleId: string): void {
    const curriculum = this.curriculum();
    if (!curriculum) return;

    const module = curriculum.modules.find(m => m.id === moduleId);
    if (!module) return;

    const newLesson: Omit<Lesson, 'id'> = {
      title: 'New Lesson',
      description: 'Lesson description',
      content: 'Lesson content',
      order: module.lessons.length + 1,
      duration: 60,
      type: 'lecture',
      materials: [],
      activities: [],
      learningOutcomes: ['Learning outcome']
    };

    this.curriculumService.addLessonToModule(curriculum.id, moduleId, newLesson).subscribe({
      next: (updatedCurriculum) => {
        this.curriculum.set(updatedCurriculum);
        this.notificationService.showSuccess('Lesson added successfully');
      },
      error: () => {
        this.notificationService.showError('Failed to add lesson');
      }
    });
  }

  deleteLesson(moduleId: string, lessonId: string): void {
    const curriculum = this.curriculum();
    if (!curriculum) return;

    if (confirm('Are you sure you want to delete this lesson?')) {
      this.curriculumService.deleteLesson(curriculum.id, moduleId, lessonId).subscribe({
        next: (updatedCurriculum) => {
          this.curriculum.set(updatedCurriculum);
          this.notificationService.showSuccess('Lesson deleted successfully');
        },
        error: () => {
          this.notificationService.showError('Failed to delete lesson');
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

  getLessonTypeBadgeClass(type: string): string {
    switch (type) {
      case 'lecture':
        return 'bg-blue-100 text-blue-800';
      case 'practical':
        return 'bg-green-100 text-green-800';
      case 'discussion':
        return 'bg-purple-100 text-purple-800';
      case 'assignment':
        return 'bg-orange-100 text-orange-800';
      case 'assessment':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

   trackByModuleId(index: number, module: any): any {
    return module.id;
  }

  trackByLessonId(index: number, lesson: Lesson): string {
    return lesson.id;
  }
}
