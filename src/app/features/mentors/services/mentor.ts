import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Mentor } from '../models/mentor';
import { FakeApi } from '../../../core/api/fake-api';

@Injectable({
  providedIn: 'root'
})
export class MentorService {
  private fakeApiService = inject(FakeApi);

  getMentors(): Observable<Mentor[]> {
    return this.fakeApiService.getMentors();
  }

  getMentorById(id: string): Observable<Mentor | undefined> {
    return this.fakeApiService.getMentorById(id);
  }

  createMentor(mentor: Omit<Mentor, 'id' | 'createdAt' | 'updatedAt'>): Observable<Mentor> {
    return this.fakeApiService.createMentor(mentor);
  }

  updateMentor(id: string, updates: Partial<Mentor>): Observable<Mentor> {
    // This would be implemented in the fake API service
    throw new Error('Update method not implemented yet');
  }

  deleteMentor(id: string): Observable<void> {
    // This would be implemented in the fake API service
    throw new Error('Delete method not implemented yet');
  }

  assignCourseToMentor(mentorId: string, courseId: string): Observable<Mentor> {
    // This would be implemented in the fake API service
    throw new Error('Assign course method not implemented yet');
  }

  unassignCourseFromMentor(mentorId: string, courseId: string): Observable<Mentor> {
    // This would be implemented in the fake API service
    throw new Error('Unassign course method not implemented yet');
  }

  getMentorByUserId(userId: string): Observable<Mentor | undefined> {
    // This would be implemented in the fake API service
    throw new Error('Get mentor by user ID method not implemented yet');
  }

  assignCourse(mentorId: string, courseId: string): Observable<void> {
    // This would be implemented in the fake API service
    throw new Error('Assign course method not implemented yet');
  }

  unassignCourse(mentorId: string, courseId: string): Observable<void> {
    // This would be implemented in the fake API service
    throw new Error('Unassign course method not implemented yet');
  }
}
