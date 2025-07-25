import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Classroom, ClassroomSchedule } from '../models/classroom';
import { FakeApi } from '../../../core/api/fake-api';

@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
  private fakeApiService = inject(FakeApi);

  getClassrooms(): Observable<Classroom[]> {
    return this.fakeApiService.getClassrooms();
  }

  getClassroomById(id: string): Observable<Classroom | undefined> {
    return this.fakeApiService.getClassroomById(id);
  }

  createClassroom(classroom: Omit<Classroom, 'id' | 'createdAt' | 'updatedAt'>): Observable<Classroom> {
    return this.fakeApiService.createClassroom(classroom);
  }

  updateClassroom(id: string, updates: Partial<Classroom>): Observable<Classroom> {
    return this.fakeApiService.updateClassroom(id, updates);
  }

  deleteClassroom(id: string): Observable<void> {
    return this.fakeApiService.deleteClassroom(id);
  }

  getAvailableClassrooms(dayOfWeek: number, startTime: string, endTime: string): Observable<Classroom[]> {
    // This would check for scheduling conflicts in a real implementation
    return this.getClassrooms();
  }

  getClassroomSchedule(classroomId: string): Observable<ClassroomSchedule[]> {
    return this.fakeApiService.getClassroomSchedule(classroomId);
  }

  checkAvailability(classroomId: string, dayOfWeek: number, startTime: string, endTime: string): Observable<boolean> {
    return this.fakeApiService.checkClassroomAvailability(classroomId, dayOfWeek, startTime, endTime);
  }
}
