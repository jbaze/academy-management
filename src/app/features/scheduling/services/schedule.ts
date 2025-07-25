import { Injectable, inject } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { Schedule, TimeSlot, ScheduleConflict } from '../models/schedule';
import { FakeApi } from '../../../core/api/fake-api';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private fakeApiService = inject(FakeApi);

  private mockSchedules: Schedule[] = [
    {
      id: '1',
      courseId: '1',
      courseName: 'Advanced Mathematics',
      mentorId: '1',
      mentorName: 'John Mentor',
      classroomId: '1',
      classroomName: 'Room A',
      dayOfWeek: 1, // Monday
      startTime: '10:00',
      endTime: '11:30',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-06-30'),
      isActive: true,
      isRecurring: true,
      recurrencePattern: {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3], // Monday, Wednesday
        endType: 'date',
        endDate: new Date('2025-06-30')
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      courseId: '2',
      courseName: 'Physics Fundamentals',
      mentorId: '1',
      mentorName: 'John Mentor',
      classroomId: '2',
      classroomName: 'Room B',
      dayOfWeek: 2, // Tuesday
      startTime: '14:00',
      endTime: '15:30',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-06-30'),
      isActive: true,
      isRecurring: true,
      recurrencePattern: {
        type: 'weekly',
        interval: 1,
        daysOfWeek: [2, 4], // Tuesday, Thursday
        endType: 'date',
        endDate: new Date('2025-06-30')
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private mockConflicts: ScheduleConflict[] = [
    {
      id: '1',
      type: 'mentor',
      conflictingSchedules: [],
      description: 'John Mentor has overlapping schedule on Monday 10:00-11:30',
      severity: 'high',
      isResolved: false,
      createdAt: new Date()
    }
  ];

  getSchedules(): Observable<Schedule[]> {
    return of(this.mockSchedules);
  }

  getScheduleById(id: string): Observable<Schedule | undefined> {
    return of(this.mockSchedules.find(s => s.id === id));
  }

  getSchedulesByMentor(mentorId: string): Observable<Schedule[]> {
    return of(this.mockSchedules.filter(s => s.mentorId === mentorId));
  }

  getSchedulesByClassroom(classroomId: string): Observable<Schedule[]> {
    return of(this.mockSchedules.filter(s => s.classroomId === classroomId));
  }

  getSchedulesByDateRange(startDate: Date, endDate: Date): Observable<Schedule[]> {
    return of(this.mockSchedules.filter(s =>
      s.startDate <= endDate && s.endDate >= startDate
    ));
  }

  createSchedule(schedule: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Observable<Schedule> {
    const newSchedule: Schedule = {
      ...schedule,
      id: (this.mockSchedules.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockSchedules.push(newSchedule);
    return of(newSchedule);
  }

  updateSchedule(id: string, updates: Partial<Schedule>): Observable<Schedule> {
    const index = this.mockSchedules.findIndex(s => s.id === id);
    if (index !== -1) {
      this.mockSchedules[index] = {
        ...this.mockSchedules[index],
        ...updates,
        updatedAt: new Date()
      };
      return of(this.mockSchedules[index]);
    }
    throw new Error('Schedule not found');
  }

  deleteSchedule(id: string): Observable<void> {
    const index = this.mockSchedules.findIndex(s => s.id === id);
    if (index !== -1) {
      this.mockSchedules.splice(index, 1);
    }
    return of(void 0);
  }

  getConflicts(): Observable<ScheduleConflict[]> {
    return of(this.mockConflicts);
  }

  resolveConflict(conflictId: string): Observable<void> {
    const conflict = this.mockConflicts.find(c => c.id === conflictId);
    if (conflict) {
      conflict.isResolved = true;
    }
    return of(void 0);
  }

  checkConflicts(schedule: Schedule): Observable<ScheduleConflict[]> {
    // Simulate conflict checking logic
    return of([]);
  }

  generateTimeSlots(schedule: Schedule): Observable<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    const currentDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);

    while (currentDate <= endDate) {
      if (currentDate.getDay() === schedule.dayOfWeek) {
        slots.push({
          id: `${schedule.id}-${currentDate.toISOString().split('T')[0]}`,
          scheduleId: schedule.id,
          date: new Date(currentDate),
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          status: 'scheduled'
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return of(slots);
  }
}
