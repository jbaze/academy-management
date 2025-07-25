import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Curriculum, CurriculumModule, Lesson, LearningPath } from '../models/curriculum';

@Injectable({
  providedIn: 'root'
})
export class CurriculumService {
  private curriculums: Curriculum[] = [
    {
      id: '1',
      courseId: '1',
      name: 'Advanced Mathematics Curriculum',
      description: 'Comprehensive curriculum covering advanced mathematical concepts for high school students',
      duration: 12,
      difficulty: 'advanced',
      modules: [
        {
          id: '1',
          name: 'Calculus Fundamentals',
          description: 'Introduction to differential and integral calculus',
          order: 1,
          duration: 20,
          lessons: [
            {
              id: '1',
              title: 'Introduction to Limits',
              description: 'Understanding the concept of limits in calculus',
              content: 'Detailed explanation of limits...',
              order: 1,
              duration: 90,
              type: 'lecture',
              materials: [
                {
                  id: '1',
                  name: 'Limits Textbook Chapter',
                  type: 'document',
                  url: '/materials/limits-chapter.pdf',
                  isRequired: true,
                  estimatedTime: 30
                }
              ],
              activities: [
                {
                  id: '1',
                  name: 'Limit Calculation Practice',
                  description: 'Practice calculating various types of limits',
                  type: 'individual',
                  duration: 30,
                  instructions: 'Solve the provided limit problems...',
                  materials: ['Calculator', 'Worksheet'],
                  expectedOutcome: 'Students will be able to calculate basic limits'
                }
              ],
              learningOutcomes: [
                'Define the concept of a limit',
                'Calculate simple limits algebraically',
                'Identify when limits do not exist'
              ]
            }
          ],
          objectives: [
            'Master fundamental calculus concepts',
            'Apply calculus to real-world problems'
          ],
          resources: [
            {
              id: '1',
              name: 'Calculus Textbook',
              type: 'book',
              description: 'Primary textbook for calculus concepts',
              isRequired: true,
              cost: 120
            }
          ],
          assessments: [
            {
              id: '1',
              name: 'Calculus Module Quiz',
              type: 'quiz',
              description: 'Assessment covering limits and derivatives',
              totalPoints: 100,
              passingScore: 70,
              duration: 60,
              isGraded: true
            }
          ],
          isRequired: true
        }
      ],
      prerequisites: ['Algebra II', 'Trigonometry'],
      learningObjectives: [
        'Master advanced mathematical concepts',
        'Develop problem-solving skills',
        'Prepare for higher education mathematics'
      ],
      assessmentMethods: [
        { type: 'Quizzes', percentage: 30, description: 'Regular knowledge checks' },
        { type: 'Tests', percentage: 40, description: 'Comprehensive module assessments' },
        { type: 'Projects', percentage: 20, description: 'Applied mathematics projects' },
        { type: 'Participation', percentage: 10, description: 'Class engagement and homework' }
      ],
      totalLessons: 24,
      totalHours: 48,
      version: '1.0',
      isActive: true,
      createdBy: '2', // mentor user id
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private learningPaths: LearningPath[] = [
    {
      id: '1',
      name: 'Mathematics Mastery Path',
      description: 'Complete mathematics learning journey from basics to advanced',
      curriculumIds: ['1'],
      prerequisites: ['Basic Arithmetic'],
      estimatedDuration: 36,
      difficulty: 'intermediate',
      targetAudience: ['High School Students', 'College Prep'],
      certificationAvailable: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  getCurriculums(): Observable<Curriculum[]> {
    return of(this.curriculums).pipe(delay(500));
  }

  getCurriculumById(id: string): Observable<Curriculum | undefined> {
    return of(this.curriculums.find(c => c.id === id)).pipe(delay(500));
  }

  getCurriculumsByCourse(courseId: string): Observable<Curriculum[]> {
    return of(this.curriculums.filter(c => c.courseId === courseId)).pipe(delay(500));
  }

  createCurriculum(curriculum: Omit<Curriculum, 'id' | 'createdAt' | 'updatedAt'>): Observable<Curriculum> {
    const newCurriculum: Curriculum = {
      ...curriculum,
      id: (this.curriculums.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.curriculums.push(newCurriculum);
    return of(newCurriculum).pipe(delay(1000));
  }

  updateCurriculum(id: string, updates: Partial<Curriculum>): Observable<Curriculum> {
    const index = this.curriculums.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Curriculum not found');
    }

    this.curriculums[index] = {
      ...this.curriculums[index],
      ...updates,
      updatedAt: new Date()
    };
    return of(this.curriculums[index]).pipe(delay(1000));
  }

  deleteCurriculum(id: string): Observable<void> {
    const index = this.curriculums.findIndex(c => c.id === id);
    if (index !== -1) {
      this.curriculums.splice(index, 1);
    }
    return of(void 0).pipe(delay(500));
  }

  duplicateCurriculum(id: string): Observable<Curriculum> {
    const original = this.curriculums.find(c => c.id === id);
    if (!original) {
      throw new Error('Curriculum not found');
    }

    const duplicate: Curriculum = {
      ...original,
      id: (this.curriculums.length + 1).toString(),
      name: `${original.name} (Copy)`,
      version: '1.0',
      isActive: false,
      approvedBy: undefined,
      approvedAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.curriculums.push(duplicate);
    return of(duplicate).pipe(delay(1000));
  }

  approveCurriculum(id: string, approvedBy: string): Observable<Curriculum> {
    return this.updateCurriculum(id, {
      approvedBy,
      approvedAt: new Date(),
      isActive: true
    });
  }

  addModuleToCurriculum(curriculumId: string, module: Omit<CurriculumModule, 'id'>): Observable<Curriculum> {
    const curriculum = this.curriculums.find(c => c.id === curriculumId);
    if (!curriculum) {
      throw new Error('Curriculum not found');
    }

    const newModule: CurriculumModule = {
      ...module,
      id: Date.now().toString()
    };

    curriculum.modules.push(newModule);
    curriculum.updatedAt = new Date();

    return of(curriculum).pipe(delay(500));
  }

  updateModule(curriculumId: string, moduleId: string, updates: Partial<CurriculumModule>): Observable<Curriculum> {
    const curriculum = this.curriculums.find(c => c.id === curriculumId);
    if (!curriculum) {
      throw new Error('Curriculum not found');
    }

    const moduleIndex = curriculum.modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) {
      throw new Error('Module not found');
    }

    curriculum.modules[moduleIndex] = {
      ...curriculum.modules[moduleIndex],
      ...updates
    };
    curriculum.updatedAt = new Date();

    return of(curriculum).pipe(delay(500));
  }

  deleteModule(curriculumId: string, moduleId: string): Observable<Curriculum> {
    const curriculum = this.curriculums.find(c => c.id === curriculumId);
    if (!curriculum) {
      throw new Error('Curriculum not found');
    }

    curriculum.modules = curriculum.modules.filter(m => m.id !== moduleId);
    curriculum.updatedAt = new Date();

    return of(curriculum).pipe(delay(500));
  }

  addLessonToModule(curriculumId: string, moduleId: string, lesson: Omit<Lesson, 'id'>): Observable<Curriculum> {
    const curriculum = this.curriculums.find(c => c.id === curriculumId);
    if (!curriculum) {
      throw new Error('Curriculum not found');
    }

    const module = curriculum.modules.find(m => m.id === moduleId);
    if (!module) {
      throw new Error('Module not found');
    }

    const newLesson: Lesson = {
      ...lesson,
      id: Date.now().toString()
    };

    module.lessons.push(newLesson);
    curriculum.updatedAt = new Date();

    return of(curriculum).pipe(delay(500));
  }

  updateLesson(curriculumId: string, moduleId: string, lessonId: string, updates: Partial<Lesson>): Observable<Curriculum> {
    const curriculum = this.curriculums.find(c => c.id === curriculumId);
    if (!curriculum) {
      throw new Error('Curriculum not found');
    }

    const module = curriculum.modules.find(m => m.id === moduleId);
    if (!module) {
      throw new Error('Module not found');
    }

    const lessonIndex = module.lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex === -1) {
      throw new Error('Lesson not found');
    }

    module.lessons[lessonIndex] = {
      ...module.lessons[lessonIndex],
      ...updates
    };
    curriculum.updatedAt = new Date();

    return of(curriculum).pipe(delay(500));
  }

  deleteLesson(curriculumId: string, moduleId: string, lessonId: string): Observable<Curriculum> {
    const curriculum = this.curriculums.find(c => c.id === curriculumId);
    if (!curriculum) {
      throw new Error('Curriculum not found');
    }

    const module = curriculum.modules.find(m => m.id === moduleId);
    if (!module) {
      throw new Error('Module not found');
    }

    module.lessons = module.lessons.filter(l => l.id !== lessonId);
    curriculum.updatedAt = new Date();

    return of(curriculum).pipe(delay(500));
  }

  getLearningPaths(): Observable<LearningPath[]> {
    return of(this.learningPaths).pipe(delay(500));
  }

  createLearningPath(path: Omit<LearningPath, 'id' | 'createdAt' | 'updatedAt'>): Observable<LearningPath> {
    const newPath: LearningPath = {
      ...path,
      id: (this.learningPaths.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.learningPaths.push(newPath);
    return of(newPath).pipe(delay(1000));
  }

  updateLearningPath(id: string, updates: Partial<LearningPath>): Observable<LearningPath> {
    const index = this.learningPaths.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Learning path not found');
    }

    this.learningPaths[index] = {
      ...this.learningPaths[index],
      ...updates,
      updatedAt: new Date()
    };
    return of(this.learningPaths[index]).pipe(delay(1000));
  }

  exportCurriculum(id: string): Observable<Blob> {
    const curriculum = this.curriculums.find(c => c.id === id);
    if (!curriculum) {
      throw new Error('Curriculum not found');
    }

    const data = JSON.stringify(curriculum, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    return of(blob).pipe(delay(500));
  }

  importCurriculum(file: File): Observable<Curriculum> {
    // In a real implementation, this would parse the file
    // For now, we'll simulate the import
    return new Observable<Curriculum>(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          const newCurriculum: Curriculum = {
            ...data,
            id: (this.curriculums.length + 1).toString(),
            createdAt: new Date(),
            updatedAt: new Date()
          };
          this.curriculums.push(newCurriculum);
          observer.next(newCurriculum);
          observer.complete();
        } catch (error) {
          observer.error('Invalid curriculum file');
        }
      };
      reader.readAsText(file);
    }).pipe(delay(1000));
  }
}
