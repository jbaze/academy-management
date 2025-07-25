import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Student } from '../models/student';
import { FakeApi } from '../../../core/api/fake-api';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private fakeApiService = inject(FakeApi);

  getStudents(): Observable<Student[]> {
    return this.fakeApiService.getStudents();
  }

  getStudentById(id: string): Observable<Student | undefined> {
    return this.fakeApiService.getStudentById(id);
  }

  getStudentsByParent(parentId: string): Observable<Student[]> {
    return this.fakeApiService.getStudentsByParent(parentId);
  }

  createStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Observable<Student> {
    return this.fakeApiService.createStudent(student);
  }

  updateStudent(id: string, updates: Partial<Student>): Observable<Student> {
    return this.fakeApiService.updateStudent(id, updates);
  }

  deleteStudent(id: string): Observable<void> {
    // This would be implemented in the fake API service
    throw new Error('Delete method not implemented yet');
  }

  enrollStudentInCourse(studentId: string, courseId: string): Observable<Student> {
    // This would be implemented in the fake API service
    throw new Error('Enroll method not implemented yet');
  }

  unenrollStudentFromCourse(studentId: string, courseId: string): Observable<Student> {
    // This would be implemented in the fake API service
    throw new Error('Unenroll method not implemented yet');
  }
}
