import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { StudentProgress, Assignment, Assessment, AttendanceRecord, ProgressNote } from '../models/progress';

@Injectable({
  providedIn: 'root'
})
export class StudentProgressService {

  // Mock data - in real app this would come from API
  private mockProgress: StudentProgress[] = [
    {
      id: '1',
      studentId: '1',
      courseId: '1',
      courseName: 'Advanced Mathematics',
      mentorId: '1',
      mentorName: 'John Mentor',
      overallGrade: 87.5,
      letterGrade: 'B+',
      attendanceRate: 92,
      assignments: [
        {
          id: '1',
          title: 'Calculus Problem Set #1',
          description: 'Integration and differentiation problems',
          dueDate: new Date('2025-01-15'),
          submittedDate: new Date('2025-01-14'),
          grade: 85,
          maxGrade: 100,
          status: 'graded',
          feedback: 'Good work on most problems. Review chain rule applications.',
          type: 'homework'
        },
        {
          id: '2',
          title: 'Linear Algebra Project',
          description: 'Matrix operations and applications',
          dueDate: new Date('2025-01-20'),
          grade: 92,
          maxGrade: 100,
          status: 'graded',
          feedback: 'Excellent understanding of concepts!',
          type: 'project'
        },
        {
          id: '3',
          title: 'Weekly Quiz #3',
          description: 'Trigonometry and functions',
          dueDate: new Date('2025-01-25'),
          submittedDate: new Date('2025-01-25'),
          grade: 78,
          maxGrade: 100,
          status: 'graded',
          feedback: 'Need to practice more trigonometric identities.',
          type: 'quiz'
        }
      ],
      assessments: [
        {
          id: '1',
          title: 'Midterm Exam',
          date: new Date('2025-01-10'),
          type: 'midterm',
          grade: 88,
          maxGrade: 100,
          weightage: 30,
          topics: ['Algebra', 'Calculus', 'Functions'],
          feedback: 'Strong performance overall. Focus on word problems.'
        },
        {
          id: '2',
          title: 'Unit Test - Calculus',
          date: new Date('2025-01-18'),
          type: 'test',
          grade: 91,
          maxGrade: 100,
          weightage: 20,
          topics: ['Derivatives', 'Integrals'],
          feedback: 'Excellent grasp of calculus concepts!'
        }
      ],
      milestones: [
        {
          id: '1',
          title: 'Master Basic Calculus',
          description: 'Understand derivatives and basic integration',
          targetDate: new Date('2025-01-31'),
          completedDate: new Date('2025-01-20'),
          status: 'completed',
          progress: 100
        },
        {
          id: '2',
          title: 'Complete Linear Algebra Module',
          description: 'Matrix operations and vector spaces',
          targetDate: new Date('2025-02-15'),
          status: 'in-progress',
          progress: 75
        }
      ],
      notes: [
        {
          id: '1',
          date: new Date('2025-01-15'),
          author: 'John Mentor',
          type: 'achievement',
          content: 'Alice showed excellent problem-solving skills in today\'s session.',
          isPrivate: false
        },
        {
          id: '2',
          date: new Date('2025-01-10'),
          author: 'John Mentor',
          type: 'improvement',
          content: 'Recommend additional practice with word problems and application-based questions.',
          isPrivate: false
        }
      ],
      lastUpdated: new Date()
    }
  ];

  private mockAttendance: AttendanceRecord[] = [
    { id: '1', studentId: '1', courseId: '1', date: new Date('2025-01-08'), status: 'present' },
    { id: '2', studentId: '1', courseId: '1', date: new Date('2025-01-10'), status: 'present' },
    { id: '3', studentId: '1', courseId: '1', date: new Date('2025-01-12'), status: 'late', notes: '15 minutes late' },
    { id: '4', studentId: '1', courseId: '1', date: new Date('2025-01-15'), status: 'present' },
    { id: '5', studentId: '1', courseId: '1', date: new Date('2025-01-17'), status: 'absent', notes: 'Sick leave' },
    { id: '6', studentId: '1', courseId: '1', date: new Date('2025-01-19'), status: 'present' },
    { id: '7', studentId: '1', courseId: '1', date: new Date('2025-01-22'), status: 'present' },
    { id: '8', studentId: '1', courseId: '1', date: new Date('2025-01-24'), status: 'present' }
  ];

  getStudentProgress(studentId: string): Observable<StudentProgress[]> {
    return of(this.mockProgress.filter(p => p.studentId === studentId)).pipe(delay(500));
  }

  getProgressByCourse(studentId: string, courseId: string): Observable<StudentProgress | undefined> {
    return of(this.mockProgress.find(p => p.studentId === studentId && p.courseId === courseId)).pipe(delay(500));
  }

  getAttendanceRecords(studentId: string, courseId?: string): Observable<AttendanceRecord[]> {
    let records = this.mockAttendance.filter(a => a.studentId === studentId);
    if (courseId) {
      records = records.filter(a => a.courseId === courseId);
    }
    return of(records).pipe(delay(300));
  }

  addProgressNote(studentId: string, courseId: string, note: Omit<ProgressNote, 'id'>): Observable<ProgressNote> {
    const newNote: ProgressNote = {
      ...note,
      id: Math.random().toString(36).substr(2, 9)
    };

    const progressIndex = this.mockProgress.findIndex(p => p.studentId === studentId && p.courseId === courseId);
    if (progressIndex !== -1) {
      this.mockProgress[progressIndex].notes.unshift(newNote);
    }

    return of(newNote).pipe(delay(300));
  }

  updateAssignmentGrade(assignmentId: string, grade: number, feedback?: string): Observable<Assignment> {
    // Implementation for updating assignment grades
    throw new Error('Method not implemented yet');
  }

  getGradeTrend(studentId: string, courseId: string): Observable<{ date: Date, grade: number }[]> {
    // Mock grade trend data
    const trendData = [
      { date: new Date('2025-01-08'), grade: 82 },
      { date: new Date('2025-01-10'), grade: 85 },
      { date: new Date('2025-01-12'), grade: 88 },
      { date: new Date('2025-01-15'), grade: 87 },
      { date: new Date('2025-01-17'), grade: 89 },
      { date: new Date('2025-01-19'), grade: 87.5 }
    ];

    return of(trendData).pipe(delay(400));
  }
}
