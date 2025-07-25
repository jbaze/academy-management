import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Course } from '../models/course';
import { CourseService } from '../services/course';
import { StudentService } from '../../students/services/student';
import { MentorService } from '../../mentors/services/mentor';
import { UserService } from '../../../core/services/user';
import { ClassroomService } from '../../classrooms/services/classroom';
import { Auth } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { Student } from '../../students/models/student';
import { Mentor } from '../../mentors/models/mentor';
import { User } from '../../../core/models/user';
import { Classroom } from '../../classrooms/models/classroom';
import { UserRole } from '../../../core/models/role';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.scss'
})
export class CourseDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private studentService = inject(StudentService);
  private mentorService = inject(MentorService);
  private userService = inject(UserService);
  private classroomService = inject(ClassroomService);
  private authService = inject(Auth);
  private notificationService = inject(NotificationService);

  course = signal<Course | null>(null);
  enrolledStudents = signal<Student[]>([]);
  mentor = signal<{ mentor: Mentor; user: User } | null>(null);
  classroom = signal<Classroom | null>(null);
  loading = signal(false);

  currentUser = computed(() => this.authService.getCurrentUser());
  canEdit = computed(() => {
    const user = this.currentUser();
    return user?.role === UserRole.ADMIN ||
           (user?.role === UserRole.MENTOR && this.mentor()?.user.id === user.id);
  });

  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourse(courseId);
    }
  }

  private loadCourse(id: string): void {
    this.loading.set(true);

    this.courseService.getCourseById(id).subscribe({
      next: (course) => {
        if (course) {
          this.course.set(course);
          this.loadEnrolledStudents(course.enrolledStudents);
          this.loadMentor(course.mentorId);
          this.loadClassroom(course.classroomId);
        }
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load course');
        this.loading.set(false);
      }
    });
  }

  private loadEnrolledStudents(studentIds: string[]): void {
    if (studentIds.length === 0) {
      this.enrolledStudents.set([]);
      return;
    }

    this.studentService.getStudents().subscribe({
      next: (allStudents) => {
        const enrolled = allStudents.filter(student => studentIds.includes(student.id));
        this.enrolledStudents.set(enrolled);
      },
      error: () => {
        console.error('Failed to load enrolled students');
      }
    });
  }

  private loadMentor(mentorId: string): void {
    if (!mentorId) return;

    this.mentorService.getMentorById(mentorId).subscribe({
      next: (mentor) => {
        if (mentor) {
          this.userService.getUserById(mentor.userId).subscribe({
            next: (user) => {
              if (user) {
                this.mentor.set({ mentor, user });
              }
            }
          });
        }
      },
      error: () => {
        console.error('Failed to load mentor information');
      }
    });
  }

  private loadClassroom(classroomId: string): void {
    if (!classroomId) return;

    this.classroomService.getClassroomById(classroomId).subscribe({
      next: (classroom) => {
        if (classroom) {
          this.classroom.set(classroom);
        }
      },
      error: () => {
        console.error('Failed to load classroom information');
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800';
      case 'inactive':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
      case 'suspended':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
      default:
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
    }
  }

  getLevelBadgeClass(level: string): string {
    switch (level) {
      case 'beginner':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getEnrollmentRate(): number {
    const course = this.course();
    return course && course.maxStudents > 0
      ? Math.round((course.currentStudents / course.maxStudents) * 100)
      : 0;
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  formatSchedule(schedule: { dayOfWeek: number; startTime: string; endTime: string }[]): string {
    return schedule.map(s =>
      `${this.daysOfWeek[s.dayOfWeek]} ${this.formatTime(s.startTime)}-${this.formatTime(s.endTime)}`
    ).join(', ');
  }

  getAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}
