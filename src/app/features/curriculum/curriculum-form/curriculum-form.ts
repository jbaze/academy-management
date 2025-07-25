import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Curriculum, CurriculumModule } from '../models/curriculum';
import { CurriculumService } from '../services/curriculum';
import { CourseService } from '../../courses/services/course';
import { Auth } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { Course } from '../../courses/models/course';

@Component({
  selector: 'app-curriculum-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './curriculum-form.html',
  styleUrl: './curriculum-form.scss'
})
export class CurriculumForm implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private curriculumService = inject(CurriculumService);
  private courseService = inject(CourseService);
  private authService = inject(Auth);
  private notificationService = inject(NotificationService);

  curriculumForm: FormGroup;
  curriculumId = signal<string | null>(null);
  isEditing = signal(false);
  isLoading = signal(false);
  courses = signal<Course[]>([]);
  activeModuleIndex = signal<number | null>(null);

  difficultyLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  assessmentTypes = [
    'Quizzes', 'Tests', 'Projects', 'Assignments', 'Presentations',
    'Participation', 'Lab Work', 'Portfolio', 'Peer Review'
  ];

  constructor() {
    this.curriculumForm = this.formBuilder.group({
      courseId: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      duration: [12, [Validators.required, Validators.min(1), Validators.max(52)]],
      difficulty: ['intermediate', [Validators.required]],
      prerequisites: this.formBuilder.array([]),
      learningObjectives: this.formBuilder.array([]),
      assessmentMethods: this.formBuilder.array([]),
      modules: this.formBuilder.array([]),
      version: ['1.0', [Validators.required]],
      isActive: [false]
    });
  }

  ngOnInit(): void {
    this.loadCourses();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.curriculumId.set(id);
      this.isEditing.set(true);
      this.loadCurriculum(id);
    } else {
      // Initialize with default arrays
      this.addPrerequisite();
      this.addLearningObjective();
      this.addAssessmentMethod();
      this.addModule();
    }
  }

  // FIX: Add missing loadCourses method
  private loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this.courses.set(courses);
      },
      error: () => {
        this.notificationService.showError('Failed to load courses');
      }
    });
  }

  // FIX: Add missing loadCurriculum method
  private loadCurriculum(id: string): void {
    this.isLoading.set(true);
    this.curriculumService.getCurriculumById(id).subscribe({
      next: (curriculum) => {
        if (curriculum) {
          this.populateForm(curriculum);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load curriculum');
        this.isLoading.set(false);
      }
    });
  }

  // FIX: Add missing populateForm method
  private populateForm(curriculum: Curriculum): void {
    this.curriculumForm.patchValue({
      courseId: curriculum.courseId,
      name: curriculum.name,
      description: curriculum.description,
      duration: curriculum.duration,
      difficulty: curriculum.difficulty,
      version: curriculum.version,
      isActive: curriculum.isActive
    });

    // Populate arrays
    this.clearAndPopulateArray('prerequisites', curriculum.prerequisites);
    this.clearAndPopulateArray('learningObjectives', curriculum.learningObjectives);
    this.clearAndPopulateAssessmentMethods(curriculum.assessmentMethods);
    this.clearAndPopulateModules(curriculum.modules);
  }

  // FIX: Add missing clearAndPopulateArray method
  private clearAndPopulateArray(arrayName: string, items: string[]): void {
    const array = this.curriculumForm.get(arrayName) as FormArray;
    array.clear();
    items.forEach(item => {
      array.push(this.formBuilder.control(item, Validators.required));
    });
    if (items.length === 0) {
      array.push(this.formBuilder.control('', Validators.required));
    }
  }

  // FIX: Add missing clearAndPopulateAssessmentMethods method
  private clearAndPopulateAssessmentMethods(methods: any[]): void {
    const array = this.curriculumForm.get('assessmentMethods') as FormArray;
    array.clear();
    methods.forEach(method => {
      array.push(this.formBuilder.group({
        type: [method.type, Validators.required],
        percentage: [method.percentage, [Validators.required, Validators.min(0), Validators.max(100)]],
        description: [method.description, Validators.required]
      }));
    });
    if (methods.length === 0) {
      this.addAssessmentMethod();
    }
  }

  // FIX: Add missing clearAndPopulateModules method
  private clearAndPopulateModules(modules: CurriculumModule[]): void {
    const array = this.curriculumForm.get('modules') as FormArray;
    array.clear();
    modules.forEach((module, index) => {
      array.push(this.createModuleFormGroup(module, index));
    });
    if (modules.length === 0) {
      this.addModule();
    }
  }

  // FIX: Add missing createModuleFormGroup method
  private createModuleFormGroup(module?: CurriculumModule, order?: number): FormGroup {
    return this.formBuilder.group({
      name: [module?.name || '', [Validators.required]],
      description: [module?.description || '', [Validators.required]],
      order: [order !== undefined ? order + 1 : 1, [Validators.required, Validators.min(1)]],
      duration: [module?.duration || 0, [Validators.required, Validators.min(1)]],
      objectives: this.formBuilder.array(
        module?.objectives.map(obj => this.formBuilder.control(obj, Validators.required)) ||
        [this.formBuilder.control('', Validators.required)]
      ),
      isRequired: [module?.isRequired !== false]
    });
  }

  // Form array getters
  get prerequisitesArray(): FormArray {
    return this.curriculumForm.get('prerequisites') as FormArray;
  }

  get learningObjectivesArray(): FormArray {
    return this.curriculumForm.get('learningObjectives') as FormArray;
  }

  get assessmentMethodsArray(): FormArray {
    return this.curriculumForm.get('assessmentMethods') as FormArray;
  }

  get modulesArray(): FormArray {
    return this.curriculumForm.get('modules') as FormArray;
  }

  getModuleObjectivesArray(moduleIndex: number): FormArray {
    return this.modulesArray.at(moduleIndex).get('objectives') as FormArray;
  }

  // Add/Remove methods for prerequisites
  addPrerequisite(): void {
    this.prerequisitesArray.push(this.formBuilder.control('', Validators.required));
  }

  removePrerequisite(index: number): void {
    this.prerequisitesArray.removeAt(index);
  }

  // Add/Remove methods for learning objectives
  addLearningObjective(): void {
    this.learningObjectivesArray.push(this.formBuilder.control('', Validators.required));
  }

  removeLearningObjective(index: number): void {
    this.learningObjectivesArray.removeAt(index);
  }

  // Add/Remove methods for assessment methods
  addAssessmentMethod(): void {
    this.assessmentMethodsArray.push(this.formBuilder.group({
      type: ['', Validators.required],
      percentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      description: ['', Validators.required]
    }));
  }

  removeAssessmentMethod(index: number): void {
    this.assessmentMethodsArray.removeAt(index);
  }

  // Add/Remove methods for modules
  addModule(): void {
    const newOrder = this.modulesArray.length + 1;
    this.modulesArray.push(this.createModuleFormGroup(undefined, newOrder - 1));
  }

  removeModule(index: number): void {
    this.modulesArray.removeAt(index);
    // Update order for remaining modules
    this.modulesArray.controls.forEach((control, i) => {
      control.get('order')?.setValue(i + 1);
    });
  }

  // Add/Remove methods for module objectives
  addModuleObjective(moduleIndex: number): void {
    this.getModuleObjectivesArray(moduleIndex).push(
      this.formBuilder.control('', Validators.required)
    );
  }

  removeModuleObjective(moduleIndex: number, objectiveIndex: number): void {
    this.getModuleObjectivesArray(moduleIndex).removeAt(objectiveIndex);
  }

  // FIX: Add missing toggleModuleExpanded method
  toggleModuleExpanded(index: number): void {
    this.activeModuleIndex.set(
      this.activeModuleIndex() === index ? null : index
    );
  }

  // FIX: Add missing validatePercentages method
  validatePercentages(): boolean {
    const total = this.assessmentMethodsArray.controls.reduce((sum, control) => {
      return sum + (control.get('percentage')?.value || 0);
    }, 0);
    return total === 100;
  }

  // FIX: Add missing getPercentageTotal method
  getPercentageTotal(): number {
    return this.assessmentMethodsArray.controls.reduce((sum, control) => {
      return sum + (control.get('percentage')?.value || 0);
    }, 0);
  }

  // FIX: Add missing onSubmit method
  onSubmit(): void {
    if (this.curriculumForm.valid) {
      this.isLoading.set(true);

      const formValue = this.curriculumForm.getRawValue();
      const currentUser = this.authService.getCurrentUser();

      const curriculumData = {
        ...formValue,
        modules: formValue.modules.map((module: any, index: number) => ({
          ...module,
          id: Date.now().toString() + index,
          lessons: [],
          resources: [],
          assessments: []
        })),
        totalLessons: 0,
        totalHours: formValue.modules.reduce((total: number, module: any) => total + module.duration, 0),
        createdBy: currentUser?.id || '',
        approvedBy: undefined,
        approvedAt: undefined
      };

      const operation = this.isEditing()
        ? this.curriculumService.updateCurriculum(this.curriculumId()!, curriculumData)
        : this.curriculumService.createCurriculum(curriculumData);

      operation.subscribe({
        next: () => {
          this.notificationService.showSuccess(
            `Curriculum ${this.isEditing() ? 'updated' : 'created'} successfully`
          );
          this.router.navigate(['/curriculum']);
        },
        error: () => {
          this.notificationService.showError(
            `Failed to ${this.isEditing() ? 'update' : 'create'} curriculum`
          );
          this.isLoading.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // FIX: Add missing markFormGroupTouched method
  private markFormGroupTouched(): void {
    Object.keys(this.curriculumForm.controls).forEach(key => {
      this.curriculumForm.get(key)?.markAsTouched();
    });
  }

  // FIX: Add missing onCancel method
  onCancel(): void {
    this.router.navigate(['/curriculum']);
  }

  // Form getters for template
  get courseId() { return this.curriculumForm.get('courseId'); }
  get name() { return this.curriculumForm.get('name'); }
  get description() { return this.curriculumForm.get('description'); }
  get duration() { return this.curriculumForm.get('duration'); }
  get difficulty() { return this.curriculumForm.get('difficulty'); }
  get version() { return this.curriculumForm.get('version'); }
}
