import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Course } from '../models/course';
import { FakeApi} from '../../../core/api/fake-api';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private fakeApiService = inject(FakeApi);

  getCourses(): Observable<Course[]> {
    return this.fakeApiService.getCourses();
  }

  getCourseById(id: string): Observable<Course | undefined> {
    return this.fakeApiService.getCourseById(id);
  }

  getCoursesByMentor(mentorId: string): Observable<Course[]> {
    return this.fakeApiService.getCoursesByMentor(mentorId);
  }

  createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Observable<Course> {
    return this.fakeApiService.createCourse(course);
  }

  updateCourse(id: string, updates: Partial<Course>): Observable<Course> {
    return this.fakeApiService.updateCourse(id, updates);
  }

  deleteCourse(id: string): Observable<void> {
    // This would be implemented in the fake API service
    throw new Error('Delete method not implemented yet');
  }

   getCoursesByClassroom(classroomId: string): Observable<Course[]> {
    return this.fakeApiService.getCourses().pipe(
      map(courses => courses.filter(course => course.classroomId === classroomId))
    );
  }
}
