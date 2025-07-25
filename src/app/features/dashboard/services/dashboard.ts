import { Injectable, inject, signal } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { StudentService } from '../../students/services/student';
import { MentorService } from '../../mentors/services/mentor';
import { CourseService } from '../../courses/services/course';
import { UserService } from '../../../core/services/user';
import { Auth } from '../../../core/services/auth';

export interface DashboardStats {
  totalStudents: number;
  totalMentors: number;
  totalCourses: number;
  activeEnrollments: number;
  recentActivity: ActivityItem[];
  upcomingClasses: UpcomingClass[];
  pendingTasks: number;
  monthlyRevenue?: number;
}

export interface ActivityItem {
  id: string;
  type: 'enrollment' | 'course_created' | 'student_added' | 'mentor_assigned';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

export interface UpcomingClass {
  id: string;
  courseName: string;
  mentorName: string;
  studentCount: number;
  time: string;
  classroom: string;
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private studentService = inject(StudentService);
  private mentorService = inject(MentorService);
  private courseService = inject(CourseService);
  private userService = inject(UserService);
  private authService = inject(Auth);

  getDashboardStats(): Observable<DashboardStats> {
    return combineLatest([
      this.studentService.getStudents(),
      this.mentorService.getMentors(),
      this.courseService.getCourses(),
      this.userService.getUsers()
    ]).pipe(
      map(([students, mentors, courses, users]) => {
        const activeStudents = students.filter(s => s.isActive).length;
        const activeMentors = mentors.filter(m => m.isActive).length;
        const activeCourses = courses.filter(c => c.status === 'active').length;
        const totalEnrollments = students.reduce((sum, s) => sum + s.enrolledCourses.length, 0);

        return {
          totalStudents: activeStudents,
          totalMentors: activeMentors,
          totalCourses: activeCourses,
          activeEnrollments: totalEnrollments,
          recentActivity: this.generateRecentActivity(students, mentors, courses),
          upcomingClasses: this.generateUpcomingClasses(courses),
          pendingTasks: this.generatePendingTasks(),
          monthlyRevenue: this.calculateMonthlyRevenue(courses, students)
        };
      })
    );
  }

  getParentDashboardStats(parentId: string): Observable<DashboardStats> {
    return combineLatest([
      this.studentService.getStudentsByParent(parentId),
      this.courseService.getCourses()
    ]).pipe(
      map(([students, allCourses]) => {
        const enrolledCourseIds = students.flatMap(s => s.enrolledCourses);
        const enrolledCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id));

        return {
          totalStudents: students.length,
          totalMentors: 0,
          totalCourses: enrolledCourses.length,
          activeEnrollments: enrolledCourseIds.length,
          recentActivity: this.generateParentActivity(students, enrolledCourses),
          upcomingClasses: this.generateParentUpcomingClasses(enrolledCourses),
          pendingTasks: 0
        };
      })
    );
  }

  getMentorDashboardStats(mentorId: string): Observable<DashboardStats> {
    return combineLatest([
      this.courseService.getCoursesByMentor(mentorId),
      this.studentService.getStudents()
    ]).pipe(
      map(([courses, allStudents]) => {
        const assignedStudents = allStudents.filter(s =>
          s.enrolledCourses.some(courseId => courses.some(c => c.id === courseId))
        );

        return {
          totalStudents: assignedStudents.length,
          totalMentors: 0,
          totalCourses: courses.length,
          activeEnrollments: assignedStudents.reduce((sum, s) => sum + s.enrolledCourses.length, 0),
          recentActivity: this.generateMentorActivity(courses, assignedStudents),
          upcomingClasses: this.generateMentorUpcomingClasses(courses),
          pendingTasks: this.generateMentorPendingTasks(courses)
        };
      })
    );
  }

  private generateRecentActivity(students: any[], mentors: any[], courses: any[]): ActivityItem[] {
    const activities: ActivityItem[] = [];

    // Add recent students
    students.slice(0, 3).forEach(student => {
      activities.push({
        id: `student-${student.id}`,
        type: 'student_added',
        title: 'New Student Enrolled',
        description: `${student.firstName} ${student.lastName} joined the academy`,
        timestamp: new Date(student.createdAt),
        icon: 'user-plus'
      });
    });

    // Add recent courses
    courses.slice(0, 2).forEach(course => {
      activities.push({
        id: `course-${course.id}`,
        type: 'course_created',
        title: 'New Course Created',
        description: `${course.name} is now available`,
        timestamp: new Date(course.createdAt),
        icon: 'book-open'
      });
    });

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);
  }

  private generateUpcomingClasses(courses: any[]): UpcomingClass[] {
    const upcomingClasses: UpcomingClass[] = [];
    const today = new Date();

    courses.forEach(course => {
      course.schedule.forEach((scheduleItem: any) => {
        const nextClass = this.getNextClassDate(scheduleItem.dayOfWeek, scheduleItem.startTime);
        if (nextClass > today) {
          upcomingClasses.push({
            id: `${course.id}-${scheduleItem.dayOfWeek}`,
            courseName: course.name,
            mentorName: 'Mentor Name', // Would be loaded from mentor data
            studentCount: course.currentStudents,
            time: `${scheduleItem.startTime} - ${scheduleItem.endTime}`,
            classroom: `Room ${course.classroomId}`,
            date: nextClass
          });
        }
      });
    });

    return upcomingClasses.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5);
  }

  private generateParentActivity(students: any[], courses: any[]): ActivityItem[] {
    const activities: ActivityItem[] = [];

    students.forEach(student => {
      activities.push({
        id: `parent-student-${student.id}`,
        type: 'enrollment',
        title: 'Course Enrollment',
        description: `${student.firstName} enrolled in ${student.enrolledCourses.length} courses`,
        timestamp: new Date(student.updatedAt),
        icon: 'academic-cap'
      });
    });

    return activities.slice(0, 5);
  }

  private generateParentUpcomingClasses(courses: any[]): UpcomingClass[] {
    return this.generateUpcomingClasses(courses);
  }

  private generateMentorActivity(courses: any[], students: any[]): ActivityItem[] {
    const activities: ActivityItem[] = [];

    courses.forEach(course => {
      activities.push({
        id: `mentor-course-${course.id}`,
        type: 'mentor_assigned',
        title: 'Course Assignment',
        description: `Assigned to teach ${course.name}`,
        timestamp: new Date(course.createdAt),
        icon: 'user-check'
      });
    });

    return activities.slice(0, 5);
  }

  private generateMentorUpcomingClasses(courses: any[]): UpcomingClass[] {
    return this.generateUpcomingClasses(courses);
  }

  private generatePendingTasks(): number {
    // Mock pending tasks count
    return Math.floor(Math.random() * 10) + 1;
  }

  private generateMentorPendingTasks(courses: any[]): number {
    // Mock mentor-specific pending tasks
    return courses.length * 2; // Assuming 2 tasks per course
  }

  private calculateMonthlyRevenue(courses: any[], students: any[]): number {
    // Mock revenue calculation
    return students.reduce((sum, student) => {
      return sum + (student.enrolledCourses.length * 200); // $200 per course
    }, 0);
  }

  private getNextClassDate(dayOfWeek: number, time: string): Date {
    const today = new Date();
    const targetDay = dayOfWeek;
    const daysUntilTarget = (targetDay - today.getDay() + 7) % 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));

    const [hours, minutes] = time.split(':');
    nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    return nextDate;
  }
}
