import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Classroom } from '../models/classroom';
import { ClassroomService } from '../services/classroom';
import { CourseService } from '../../courses/services/course';
import { NotificationService } from '../../../core/services/notification';
import { Course } from '../../courses/models/course';

interface CourseWithMentor extends Course {
  mentorName: string;
}

interface Activity {
  id: string;
  type: 'scheduled' | 'updated' | 'cancelled';
  description: string;
  timestamp: Date;
}

@Component({
  selector: 'app-classroom-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './classroom-detail.html',
  styleUrl: './classroom-detail.scss'
})
export class ClassroomDetail implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private classroomService = inject(ClassroomService);
  private courseService = inject(CourseService);
  private notificationService = inject(NotificationService);

  classroom = signal<Classroom | null>(null);
  currentCourses = signal<CourseWithMentor[]>([]);
  recentActivity = signal<Activity[]>([]);
  isLoading = signal(false);

  daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClassroom(id);
      this.loadCurrentCourses(id);
      this.loadRecentActivity(id);
    }
  }

  private loadClassroom(id: string): void {
    this.isLoading.set(true);
    this.classroomService.getClassroomById(id).subscribe({
      next: (classroom) => {
        this.classroom.set(classroom || null);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load classroom details');
        this.isLoading.set(false);
      }
    });
  }

  private loadCurrentCourses(classroomId: string): void {
    this.courseService.getCoursesByClassroom(classroomId).subscribe({
      next: (courses) => {
        // In a real app, you'd also fetch mentor names
        const coursesWithMentors = courses.map(course => ({
          ...course,
          mentorName: this.getMentorName(course.mentorId)
        }));
        this.currentCourses.set(coursesWithMentors);
      },
      error: () => {
        this.notificationService.showError('Failed to load current courses');
      }
    });
  }

  private loadRecentActivity(classroomId: string): void {
    // Mock recent activity data
    // In a real app, this would come from an activity service
    const mockActivity: Activity[] = [
      {
        id: '1',
        type: 'scheduled',
        description: 'Mathematics course scheduled for Monday 10:00-11:30',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: '2',
        type: 'updated',
        description: 'Classroom capacity updated to 25 students',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        id: '3',
        type: 'scheduled',
        description: 'Physics lab session added for Friday afternoon',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];
    this.recentActivity.set(mockActivity);
  }

  private getMentorName(mentorId: string): string {
    // Mock mentor names - in a real app, you'd fetch this from the mentor service
    const mentorNames: { [key: string]: string } = {
      '1': 'Dr. John Smith',
      '2': 'Prof. Jane Doe',
      '3': 'Mr. Robert Johnson'
    };
    return mentorNames[mentorId] || 'Unknown Mentor';
  }

  toggleActivation(): void {
    const classroom = this.classroom();
    if (!classroom) return;

    this.isLoading.set(true);
    const updatedClassroom = { ...classroom, isActive: !classroom.isActive };

    this.classroomService.updateClassroom(classroom.id, updatedClassroom).subscribe({
      next: (updated) => {
        this.classroom.set(updated);
        this.notificationService.showSuccess(
          `Classroom ${updated.isActive ? 'activated' : 'deactivated'} successfully`
        );
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to update classroom status');
        this.isLoading.set(false);
      }
    });
  }

  getUtilizationPercentage(): number {
    const classroom = this.classroom();
    if (!classroom) return 0;

    const totalHoursPerWeek = 5 * 8; // 5 days * 8 hours per day
    const scheduledHours = this.currentCourses().reduce((total, course) => {
      return total + course.schedule.reduce((courseTotal, schedule) => {
        const start = this.timeToMinutes(schedule.startTime);
        const end = this.timeToMinutes(schedule.endTime);
        return courseTotal + (end - start) / 60;
      }, 0);
    }, 0);

    return Math.round((scheduledHours / totalHoursPerWeek) * 100);
  }

  getTotalStudents(): number {
    return this.currentCourses().reduce((total, course) => total + course.currentStudents, 0);
  }

  getAvailableHours(): string {
    const classroom = this.classroom();
    if (!classroom) return '0';

    const totalHoursPerWeek = 5 * 8; // 5 days * 8 hours per day
    const scheduledHours = this.currentCourses().reduce((total, course) => {
      return total + course.schedule.reduce((courseTotal, schedule) => {
        const start = this.timeToMinutes(schedule.startTime);
        const end = this.timeToMinutes(schedule.endTime);
        return courseTotal + (end - start) / 60;
      }, 0);
    }, 0);

    const availableHours = totalHoursPerWeek - scheduledHours;
    return `${availableHours.toFixed(1)}h/week`;
  }

  getDayName(dayOfWeek: number): string {
    return this.daysOfWeek[dayOfWeek] || 'Unknown';
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Track by functions for ngFor
  trackByCourseId(index: number, course: CourseWithMentor): string {
    return course.id;
  }

  trackByActivityId(index: number, activity: Activity): string {
    return activity.id;
  }

  trackByEquipment(index: number, equipment: string): string {
    return equipment;
  }
}
