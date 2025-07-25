// ===== COMPLETE FAKE API SERVICE WITH ALL MISSING METHODS =====
// src/app/core/api/fake-api.service.ts

import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User} from '../models/user';
import { Student } from '../../features/students/models/student';
import { Mentor } from '../../features/mentors/models/mentor';
import { Course } from '../../features/courses/models/course';
import { Classroom, ClassroomSchedule } from '../../features/classrooms/models/classroom';
import { CommentType, Invoice, InvoiceComment, InvoiceStatus, PaymentRecord } from '../../features/billing/models/invoice';
import { UserRole } from '../models/role';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth';

@Injectable({
  providedIn: 'root'
})
export class FakeApi {
  private users: User[] = [
    {
      id: '1',
      email: 'admin@academy.com',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      avatar: 'https://via.placeholder.com/150',
      phone: '+1234567890',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      id: '2',
      email: 'mentor@academy.com',
      firstName: 'John',
      lastName: 'Mentor',
      role: UserRole.MENTOR,
      avatar: 'https://via.placeholder.com/150',
      phone: '+1234567891',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      id: '3',
      email: 'parent@academy.com',
      firstName: 'Jane',
      lastName: 'Parent',
      role: UserRole.PARENT,
      avatar: 'https://via.placeholder.com/150',
      phone: '+1234567892',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    // Additional users for testing
    {
      id: '4',
      email: 'mentor2@academy.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: UserRole.MENTOR,
      avatar: 'https://via.placeholder.com/150',
      phone: '+1234567894',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      id: '5',
      email: 'parent2@academy.com',
      firstName: 'Michael',
      lastName: 'Johnson',
      role: UserRole.PARENT,
      avatar: 'https://via.placeholder.com/150',
      phone: '+1234567895',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
  ];

  private students: Student[] = [
    {
      id: '1',
      parentId: '3',
      firstName: 'Alice',
      lastName: 'Student',
      dateOfBirth: new Date('2010-05-15'),
      email: 'alice@example.com',
      phone: '+1234567893',
      address: '123 Main St, City, State',
      emergencyContact: {
        name: 'Jane Parent',
        phone: '+1234567892',
        relationship: 'Mother'
      },
      enrolledCourses: ['1', '2'],
      academicLevel: 'Grade 8',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      id: '2',
      parentId: '3',
      firstName: 'Bob',
      lastName: 'Student',
      dateOfBirth: new Date('2012-03-22'),
      address: '123 Main St, City, State',
      emergencyContact: {
        name: 'Jane Parent',
        phone: '+1234567892',
        relationship: 'Mother'
      },
      enrolledCourses: ['1'],
      academicLevel: 'Grade 6',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      id: '3',
      parentId: '5',
      firstName: 'Emma',
      lastName: 'Johnson',
      dateOfBirth: new Date('2011-08-10'),
      email: 'emma@example.com',
      address: '456 Oak Ave, City, State',
      emergencyContact: {
        name: 'Michael Johnson',
        phone: '+1234567895',
        relationship: 'Father'
      },
      enrolledCourses: ['2'],
      academicLevel: 'Grade 7',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
  ];

  private mentors: Mentor[] = [
    {
      id: '1',
      userId: '2',
      specialization: ['Mathematics', 'Physics'],
      experience: 5,
      qualifications: ['B.S. Mathematics', 'M.S. Physics', 'Teaching Certificate'],
      assignedCourses: ['1', '2'],
      availableHours: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '15:00' }
      ],
      hourlyRate: 50,
      bio: 'Experienced mathematics and physics tutor with 5 years of teaching experience. Passionate about helping students understand complex concepts through practical examples.',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      id: '2',
      userId: '4',
      specialization: ['English', 'Literature', 'Writing'],
      experience: 3,
      qualifications: ['B.A. English Literature', 'TESOL Certificate'],
      assignedCourses: [],
      availableHours: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '16:00' },
        { dayOfWeek: 3, startTime: '10:00', endTime: '16:00' },
        { dayOfWeek: 5, startTime: '10:00', endTime: '16:00' }
      ],
      hourlyRate: 45,
      bio: 'Dedicated English and Literature instructor with a passion for creative writing and language development.',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
  ];

  private courses: Course[] = [
    {
      id: '1',
      name: 'Advanced Mathematics',
      description: 'Advanced mathematics course for high school students covering algebra, geometry, and calculus fundamentals.',
      mentorId: '1',
      classroomId: '1',
      duration: 12,
      maxStudents: 15,
      currentStudents: 2,
      enrolledStudents: ['1', '2'],
      schedule: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '11:30' },
        { dayOfWeek: 3, startTime: '10:00', endTime: '11:30' }
      ],
      price: 200,
      level: 'advanced',
      category: 'Mathematics',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Physics Fundamentals',
      description: 'Basic physics concepts for middle school students including mechanics, electricity, and magnetism.',
      mentorId: '1',
      classroomId: '2',
      duration: 10,
      maxStudents: 12,
      currentStudents: 2,
      enrolledStudents: ['1', '3'],
      schedule: [
        { dayOfWeek: 2, startTime: '14:00', endTime: '15:30' },
        { dayOfWeek: 4, startTime: '14:00', endTime: '15:30' }
      ],
      price: 150,
      level: 'beginner',
      category: 'Physics',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 10 * 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private classrooms: Classroom[] = [
    {
      id: '1',
      name: 'Room A',
      capacity: 20,
      equipment: ['Whiteboard', 'Projector', 'Computers'],
      location: 'First Floor',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Room B',
      capacity: 15,
      equipment: ['Whiteboard', 'Laboratory Equipment'],
      location: 'Second Floor',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Room C',
      capacity: 25,
      equipment: ['Whiteboard', 'Audio System', 'Projector'],
      location: 'Third Floor',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private invoices: Invoice[] = [
    {
      id: '1',
      parentId: '3',
      studentId: '1',
      amount: 350,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      issueDate: new Date(),
      status: InvoiceStatus.PENDING,
      items: [
        {
          courseId: '1',
          courseName: 'Advanced Mathematics',
          quantity: 1,
          unitPrice: 200,
          totalPrice: 200
        },
        {
          courseId: '2',
          courseName: 'Physics Fundamentals',
          quantity: 1,
          unitPrice: 150,
          totalPrice: 150
        }
      ],
      comments: [],
      lastModified: new Date(),
      lastModifiedBy: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      parentId: '5',
      studentId: '3',
      amount: 150,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      issueDate: new Date(),
      status: InvoiceStatus.PAID,
      items: [
        {
          courseId: '2',
          courseName: 'Physics Fundamentals',
          quantity: 1,
          unitPrice: 150,
          totalPrice: 150
        }
      ],
      paymentDate: new Date(),
      paymentMethod: 'Credit Card',
      comments: [],
      lastModified: new Date(),
      lastModifiedBy: '1',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // ===== AUTHENTICATION METHODS =====

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const user = this.users.find(u => u.email === credentials.email);

    if (!user) {
      return throwError(() => new Error('User not found')).pipe(delay(1000));
    }

    // Simple password check (in real app, this would be hashed)
    const validPasswords = {
      'admin@academy.com': 'admin123',
      'mentor@academy.com': 'mentor123',
      'parent@academy.com': 'parent123',
      'mentor2@academy.com': 'mentor123',
      'parent2@academy.com': 'parent123'
    };

    if (validPasswords[credentials.email as keyof typeof validPasswords] !== credentials.password) {
      return throwError(() => new Error('Invalid credentials')).pipe(delay(1000));
    }

    const response: LoginResponse = {
      user,
      token: 'fake-jwt-token-' + user.id,
      refreshToken: 'fake-refresh-token-' + user.id,
      expiresIn: 3600
    };

    return of(response).pipe(delay(1000));
  }

  register(userData: RegisterRequest): Observable<User> {
    const existingUser = this.users.find(u => u.email === userData.email);

    if (existingUser) {
      return throwError(() => new Error('User already exists')).pipe(delay(1000));
    }

    const newUser: User = {
      id: (this.users.length + 1).toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      phone: userData.phone,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    this.users.push(newUser);
    return of(newUser).pipe(delay(1000));
  }

  // ===== USER METHODS =====

  getUsers(): Observable<User[]> {
    return of([...this.users]).pipe(delay(500));
  }

  getUserById(id: string): Observable<User | undefined> {
    return of(this.users.find(u => u.id === id)).pipe(delay(500));
  }

  updateUser(id: string, updates: Partial<User>): Observable<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return throwError(() => new Error('User not found'));
    }

    this.users[index] = { ...this.users[index], ...updates, updatedAt: new Date() };
    return of(this.users[index]).pipe(delay(1000));
  }

  deleteUser(id: string): Observable<void> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return throwError(() => new Error('User not found'));
    }

    this.users.splice(index, 1);
    return of(void 0).pipe(delay(1000));
  }

  getUsersByRole(role: UserRole): Observable<User[]> {
    return of(this.users.filter(u => u.role === role)).pipe(delay(500));
  }

  // ===== STUDENT METHODS =====

  getStudents(): Observable<Student[]> {
    return of([...this.students]).pipe(delay(500));
  }

  getStudentById(id: string): Observable<Student | undefined> {
    return of(this.students.find(s => s.id === id)).pipe(delay(500));
  }

  getStudentsByParent(parentId: string): Observable<Student[]> {
    return of(this.students.filter(s => s.parentId === parentId)).pipe(delay(500));
  }

  createStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Observable<Student> {
    const newStudent: Student = {
      ...student,
      id: (this.students.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.students.push(newStudent);
    return of(newStudent).pipe(delay(1000));
  }

  updateStudent(id: string, updates: Partial<Student>): Observable<Student> {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) {
      return throwError(() => new Error('Student not found'));
    }

    this.students[index] = { ...this.students[index], ...updates, updatedAt: new Date() };
    return of(this.students[index]).pipe(delay(1000));
  }

  deleteStudent(id: string): Observable<void> {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) {
      return throwError(() => new Error('Student not found'));
    }

    // Remove student from enrolled courses
    const student = this.students[index];
    student.enrolledCourses.forEach(courseId => {
      const courseIndex = this.courses.findIndex(c => c.id === courseId);
      if (courseIndex !== -1) {
        this.courses[courseIndex].enrolledStudents = this.courses[courseIndex].enrolledStudents.filter(sid => sid !== id);
        this.courses[courseIndex].currentStudents = this.courses[courseIndex].enrolledStudents.length;
      }
    });

    this.students.splice(index, 1);
    return of(void 0).pipe(delay(1000));
  }

  // ===== STUDENT ENROLLMENT METHODS (MISSING METHODS) =====

  enrollStudentInCourse(studentId: string, courseId: string): Observable<Student> {
    const studentIndex = this.students.findIndex(s => s.id === studentId);
    const courseIndex = this.courses.findIndex(c => c.id === courseId);

    if (studentIndex === -1) {
      return throwError(() => new Error('Student not found'));
    }

    if (courseIndex === -1) {
      return throwError(() => new Error('Course not found'));
    }

    const student = this.students[studentIndex];
    const course = this.courses[courseIndex];

    // Check if already enrolled
    if (student.enrolledCourses.includes(courseId)) {
      return throwError(() => new Error('Student already enrolled in this course'));
    }

    // Check course capacity
    if (course.currentStudents >= course.maxStudents) {
      return throwError(() => new Error('Course is at maximum capacity'));
    }

    // Enroll student
    student.enrolledCourses.push(courseId);
    course.enrolledStudents.push(studentId);
    course.currentStudents = course.enrolledStudents.length;

    student.updatedAt = new Date();
    course.updatedAt = new Date();

    return of(student).pipe(delay(1000));
  }

  unenrollStudentFromCourse(studentId: string, courseId: string): Observable<Student> {
    const studentIndex = this.students.findIndex(s => s.id === studentId);
    const courseIndex = this.courses.findIndex(c => c.id === courseId);

    if (studentIndex === -1) {
      return throwError(() => new Error('Student not found'));
    }

    if (courseIndex === -1) {
      return throwError(() => new Error('Course not found'));
    }

    const student = this.students[studentIndex];
    const course = this.courses[courseIndex];

    // Remove from student's enrolled courses
    student.enrolledCourses = student.enrolledCourses.filter(id => id !== courseId);

    // Remove from course's enrolled students
    course.enrolledStudents = course.enrolledStudents.filter(id => id !== studentId);
    course.currentStudents = course.enrolledStudents.length;

    student.updatedAt = new Date();
    course.updatedAt = new Date();

    return of(student).pipe(delay(1000));
  }

  // ===== MENTOR METHODS =====

  getMentors(): Observable<Mentor[]> {
    return of([...this.mentors]).pipe(delay(500));
  }

  getMentorById(id: string): Observable<Mentor | undefined> {
    return of(this.mentors.find(m => m.id === id)).pipe(delay(500));
  }

  getMentorByUserId(userId: string): Observable<Mentor | undefined> {
    return of(this.mentors.find(m => m.userId === userId)).pipe(delay(500));
  }

  createMentor(mentor: Omit<Mentor, 'id' | 'createdAt' | 'updatedAt'>): Observable<Mentor> {
    // Check if user already has a mentor profile
    const existingMentor = this.mentors.find(m => m.userId === mentor.userId);
    if (existingMentor) {
      return throwError(() => new Error('User already has a mentor profile'));
    }

    const newMentor: Mentor = {
      ...mentor,
      id: (this.mentors.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mentors.push(newMentor);
    return of(newMentor).pipe(delay(1000));
  }

  updateMentor(id: string, updates: Partial<Mentor>): Observable<Mentor> {
    const index = this.mentors.findIndex(m => m.id === id);
    if (index === -1) {
      return throwError(() => new Error('Mentor not found'));
    }

    this.mentors[index] = { ...this.mentors[index], ...updates, updatedAt: new Date() };
    return of(this.mentors[index]).pipe(delay(1000));
  }

  deleteMentor(id: string): Observable<void> {
    const index = this.mentors.findIndex(m => m.id === id);
    if (index === -1) {
      return throwError(() => new Error('Mentor not found'));
    }

    const mentor = this.mentors[index];

    // Unassign all courses from this mentor
    mentor.assignedCourses.forEach(courseId => {
      const courseIndex = this.courses.findIndex(c => c.id === courseId);
      if (courseIndex !== -1) {
        this.courses[courseIndex].mentorId = '';
        this.courses[courseIndex].status = 'inactive';
        this.courses[courseIndex].updatedAt = new Date();
      }
    });

    this.mentors.splice(index, 1);
    return of(void 0).pipe(delay(1000));
  }

  // ===== MENTOR-COURSE ASSIGNMENT METHODS =====

  assignCourseToMentor(mentorId: string, courseId: string): Observable<Mentor> {
    const mentorIndex = this.mentors.findIndex(m => m.id === mentorId);
    const courseIndex = this.courses.findIndex(c => c.id === courseId);

    if (mentorIndex === -1) {
      return throwError(() => new Error('Mentor not found'));
    }

    if (courseIndex === -1) {
      return throwError(() => new Error('Course not found'));
    }

    const mentor = this.mentors[mentorIndex];
    const course = this.courses[courseIndex];

    // Check if already assigned
    if (mentor.assignedCourses.includes(courseId)) {
      return throwError(() => new Error('Course already assigned to this mentor'));
    }

    // Assign course
    mentor.assignedCourses.push(courseId);
    course.mentorId = mentorId;

    mentor.updatedAt = new Date();
    course.updatedAt = new Date();

    return of(mentor).pipe(delay(1000));
  }

  unassignCourseFromMentor(mentorId: string, courseId: string): Observable<Mentor> {
    const mentorIndex = this.mentors.findIndex(m => m.id === mentorId);
    const courseIndex = this.courses.findIndex(c => c.id === courseId);

    if (mentorIndex === -1) {
      return throwError(() => new Error('Mentor not found'));
    }

    if (courseIndex === -1) {
      return throwError(() => new Error('Course not found'));
    }

    const mentor = this.mentors[mentorIndex];
    const course = this.courses[courseIndex];

    // Unassign course
    mentor.assignedCourses = mentor.assignedCourses.filter(id => id !== courseId);
    course.mentorId = '';
    course.status = 'inactive';

    mentor.updatedAt = new Date();
    course.updatedAt = new Date();

    return of(mentor).pipe(delay(1000));
  }

  // ===== COURSE METHODS =====

  getCourses(): Observable<Course[]> {
    return of([...this.courses]).pipe(delay(500));
  }

  getCourseById(id: string): Observable<Course | undefined> {
    return of(this.courses.find(c => c.id === id)).pipe(delay(500));
  }

  getCoursesByMentor(mentorId: string): Observable<Course[]> {
    return of(this.courses.filter(c => c.mentorId === mentorId)).pipe(delay(500));
  }

  getCoursesByStudent(studentId: string): Observable<Course[]> {
    return of(this.courses.filter(c => c.enrolledStudents.includes(studentId))).pipe(delay(500));
  }

  createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Observable<Course> {
    const newCourse: Course = {
      ...course,
      id: (this.courses.length + 1).toString(),
      currentStudents: course.enrolledStudents?.length || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.courses.push(newCourse);

    // Update mentor's assigned courses if mentorId is provided
    if (course.mentorId) {
      const mentorIndex = this.mentors.findIndex(m => m.id === course.mentorId);
      if (mentorIndex !== -1) {
        this.mentors[mentorIndex].assignedCourses.push(newCourse.id);
        this.mentors[mentorIndex].updatedAt = new Date();
      }
    }

    return of(newCourse).pipe(delay(1000));
  }

  updateCourse(id: string, updates: Partial<Course>): Observable<Course> {
    const index = this.courses.findIndex(c => c.id === id);
    if (index === -1) {
      return throwError(() => new Error('Course not found'));
    }

    const course = this.courses[index];
    const oldMentorId = course.mentorId;

    this.courses[index] = { ...course, ...updates, updatedAt: new Date() };

    // Update mentor assignments if mentorId changed
    if (updates.mentorId !== undefined && updates.mentorId !== oldMentorId) {
      // Remove from old mentor
      if (oldMentorId) {
        const oldMentorIndex = this.mentors.findIndex(m => m.id === oldMentorId);
        if (oldMentorIndex !== -1) {
          this.mentors[oldMentorIndex].assignedCourses = this.mentors[oldMentorIndex].assignedCourses.filter(cid => cid !== id);
          this.mentors[oldMentorIndex].updatedAt = new Date();
        }
      }

      // Add to new mentor
      if (updates.mentorId) {
        const newMentorIndex = this.mentors.findIndex(m => m.id === updates.mentorId);
        if (newMentorIndex !== -1) {
          this.mentors[newMentorIndex].assignedCourses.push(id);
          this.mentors[newMentorIndex].updatedAt = new Date();
        }
      }
    }

    return of(this.courses[index]).pipe(delay(1000));
  }

  deleteCourse(id: string): Observable<void> {
    const index = this.courses.findIndex(c => c.id === id);
    if (index === -1) {
      return throwError(() => new Error('Course not found'));
    }

    const course = this.courses[index];

    // Remove course from mentor's assigned courses
    if (course.mentorId) {
      const mentorIndex = this.mentors.findIndex(m => m.id === course.mentorId);
      if (mentorIndex !== -1) {
        this.mentors[mentorIndex].assignedCourses = this.mentors[mentorIndex].assignedCourses.filter(cid => cid !== id);
        this.mentors[mentorIndex].updatedAt = new Date();
      }
    }

    // Remove course from students' enrolled courses
    course.enrolledStudents.forEach(studentId => {
      const studentIndex = this.students.findIndex(s => s.id === studentId);
      if (studentIndex !== -1) {
        this.students[studentIndex].enrolledCourses = this.students[studentIndex].enrolledCourses.filter(cid => cid !== id);
        this.students[studentIndex].updatedAt = new Date();
      }
    });

    this.courses.splice(index, 1);
    return of(void 0).pipe(delay(1000));
  }

  // ===== CLASSROOM METHODS =====

  getClassrooms(): Observable<Classroom[]> {
    return of([...this.classrooms]).pipe(delay(500));
  }

  getClassroomById(id: string): Observable<Classroom | undefined> {
    return of(this.classrooms.find(c => c.id === id)).pipe(delay(500));
  }

  createClassroom(classroom: Omit<Classroom, 'id' | 'createdAt' | 'updatedAt'>): Observable<Classroom> {
    const newClassroom: Classroom = {
      ...classroom,
      id: (this.classrooms.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.classrooms.push(newClassroom);
    return of(newClassroom).pipe(delay(1000));
  }

  updateClassroom(id: string, updates: Partial<Classroom>): Observable<Classroom> {
    const index = this.classrooms.findIndex(c => c.id === id);
    if (index === -1) {
      return throwError(() => new Error('Classroom not found'));
    }

    this.classrooms[index] = { ...this.classrooms[index], ...updates, updatedAt: new Date() };
    return of(this.classrooms[index]).pipe(delay(1000));
  }

  deleteClassroom(id: string): Observable<void> {
    const index = this.classrooms.findIndex(c => c.id === id);
    if (index === -1) {
      return throwError(() => new Error('Classroom not found'));
    }

    // Check if any courses are using this classroom
    const coursesUsingClassroom = this.courses.filter(c => c.classroomId === id);
    if (coursesUsingClassroom.length > 0) {
      return throwError(() => new Error('Cannot delete classroom that is assigned to courses'));
    }

    this.classrooms.splice(index, 1);
    return of(void 0).pipe(delay(1000));
  }

  // ===== INVOICE METHODS =====

  getInvoices(): Observable<Invoice[]> {
    return of([...this.invoices]).pipe(delay(500));
  }

  getInvoiceById(id: string): Observable<Invoice | undefined> {
    return of(this.invoices.find(i => i.id === id)).pipe(delay(500));
  }

  getInvoicesByParent(parentId: string): Observable<Invoice[]> {
    return of(this.invoices.filter(i => i.parentId === parentId)).pipe(delay(500));
  }

  getInvoicesByStudent(studentId: string): Observable<Invoice[]> {
    return of(this.invoices.filter(i => i.studentId === studentId)).pipe(delay(500));
  }

  createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Observable<Invoice> {
    const newInvoice: Invoice = {
      ...invoice,
      id: (this.invoices.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.invoices.push(newInvoice);
    return of(newInvoice).pipe(delay(1000));
  }

  updateInvoice(id: string, updates: Partial<Invoice>): Observable<Invoice> {
    const index = this.invoices.findIndex(i => i.id === id);
    if (index === -1) {
      return throwError(() => new Error('Invoice not found'));
    }

    this.invoices[index] = { ...this.invoices[index], ...updates, updatedAt: new Date() };
    return of(this.invoices[index]).pipe(delay(1000));
  }

  deleteInvoice(id: string): Observable<void> {
    const index = this.invoices.findIndex(i => i.id === id);
    if (index === -1) {
      return throwError(() => new Error('Invoice not found'));
    }

    this.invoices.splice(index, 1);
    return of(void 0).pipe(delay(1000));
  }

  // ===== SEARCH AND UTILITY METHODS =====

  searchUsers(query: string): Observable<User[]> {
    const searchTerm = query.toLowerCase();
    return of(this.users.filter(u =>
      u.firstName.toLowerCase().includes(searchTerm) ||
      u.lastName.toLowerCase().includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm)
    )).pipe(delay(500));
  }

  searchStudents(query: string): Observable<Student[]> {
    const searchTerm = query.toLowerCase();
    return of(this.students.filter(s =>
      s.firstName.toLowerCase().includes(searchTerm) ||
      s.lastName.toLowerCase().includes(searchTerm) ||
      s.email?.toLowerCase().includes(searchTerm) ||
      s.academicLevel.toLowerCase().includes(searchTerm)
    )).pipe(delay(500));
  }

  searchCourses(query: string): Observable<Course[]> {
    const searchTerm = query.toLowerCase();
    return of(this.courses.filter(c =>
      c.name.toLowerCase().includes(searchTerm) ||
      c.description.toLowerCase().includes(searchTerm) ||
      c.category.toLowerCase().includes(searchTerm)
    )).pipe(delay(500));
  }

  searchMentors(query: string): Observable<Mentor[]> {
    const searchTerm = query.toLowerCase();
    return of(this.mentors.filter(m =>
      m.specialization.some(spec => spec.toLowerCase().includes(searchTerm)) ||
      m.qualifications.some(qual => qual.toLowerCase().includes(searchTerm)) ||
      m.bio.toLowerCase().includes(searchTerm)
    )).pipe(delay(500));
  }

  // ===== DASHBOARD AND ANALYTICS METHODS =====

  getDashboardStats(): Observable<any> {
    const stats = {
      totalStudents: this.students.length,
      activeStudents: this.students.filter(s => s.isActive).length,
      totalMentors: this.mentors.length,
      activeMentors: this.mentors.filter(m => m.isActive).length,
      totalCourses: this.courses.length,
      activeCourses: this.courses.filter(c => c.status === 'active').length,
      suspendedCourses: this.courses.filter(c => c.status === 'suspended').length,
      totalParents: this.users.filter(u => u.role === UserRole.PARENT).length,
      totalClassrooms: this.classrooms.length,
      activeClassrooms: this.classrooms.filter(c => c.isActive).length,
      pendingInvoices: this.invoices.filter(i => i.status === 'pending').length,
      paidInvoices: this.invoices.filter(i => i.status === 'paid').length,
      overdueInvoices: this.invoices.filter(i =>
        i.status === 'pending' && new Date(i.dueDate) < new Date()
      ).length,
      totalRevenue: this.invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + i.amount, 0),
      pendingRevenue: this.invoices
        .filter(i => i.status === 'pending')
        .reduce((sum, i) => sum + i.amount, 0),
      enrollmentRate: this.courses.length > 0
        ? Math.round((this.courses.reduce((sum, c) => sum + c.currentStudents, 0) /
           this.courses.reduce((sum, c) => sum + c.maxStudents, 0)) * 100)
        : 0,
      averageClassSize: this.courses.length > 0
        ? Math.round(this.courses.reduce((sum, c) => sum + c.currentStudents, 0) / this.courses.length)
        : 0,
      totalEnrollments: this.courses.reduce((sum, c) => sum + c.currentStudents, 0),
      maxPossibleEnrollments: this.courses.reduce((sum, c) => sum + c.maxStudents, 0)
    };

    return of(stats).pipe(delay(300));
  }

  // ===== ENROLLMENT ANALYTICS =====

  getEnrollmentTrends(): Observable<any[]> {
    // Generate mock enrollment trend data for the last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trends = months.map((month, index) => ({
      month,
      enrollments: Math.floor(Math.random() * 20) + 10 + index * 2,
      revenue: Math.floor(Math.random() * 5000) + 3000 + index * 500
    }));

    return of(trends).pipe(delay(500));
  }

  getCoursePopularity(): Observable<any[]> {
    const popularity = this.courses.map(course => ({
      courseId: course.id,
      courseName: course.name,
      enrollmentCount: course.currentStudents,
      enrollmentRate: Math.round((course.currentStudents / course.maxStudents) * 100),
      category: course.category,
      level: course.level
    })).sort((a, b) => b.enrollmentCount - a.enrollmentCount);

    return of(popularity).pipe(delay(500));
  }

  getMentorWorkload(): Observable<any[]> {
    const workload = this.mentors.map(mentor => {
      const user = this.users.find(u => u.id === mentor.userId);
      const assignedCourses = this.courses.filter(c => c.mentorId === mentor.id);
      const totalStudents = assignedCourses.reduce((sum, c) => sum + c.currentStudents, 0);

      return {
        mentorId: mentor.id,
        mentorName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        coursesAssigned: mentor.assignedCourses.length,
        totalStudents,
        hourlyRate: mentor.hourlyRate,
        specializations: mentor.specialization,
        experience: mentor.experience
      };
    }).sort((a, b) => b.totalStudents - a.totalStudents);

    return of(workload).pipe(delay(500));
  }

  // ===== BULK OPERATIONS =====

  bulkEnrollStudents(studentIds: string[], courseId: string): Observable<{ success: string[], failed: { studentId: string, error: string }[] }> {
    const results = { success: [] as string[], failed: [] as { studentId: string, error: string }[] };

    studentIds.forEach(studentId => {
      try {
        // Simulate enrollment logic
        const studentIndex = this.students.findIndex(s => s.id === studentId);
        const courseIndex = this.courses.findIndex(c => c.id === courseId);

        if (studentIndex === -1) {
          results.failed.push({ studentId, error: 'Student not found' });
          return;
        }

        if (courseIndex === -1) {
          results.failed.push({ studentId, error: 'Course not found' });
          return;
        }

        const student = this.students[studentIndex];
        const course = this.courses[courseIndex];

        if (student.enrolledCourses.includes(courseId)) {
          results.failed.push({ studentId, error: 'Already enrolled' });
          return;
        }

        if (course.currentStudents >= course.maxStudents) {
          results.failed.push({ studentId, error: 'Course at capacity' });
          return;
        }

        // Enroll student
        student.enrolledCourses.push(courseId);
        course.enrolledStudents.push(studentId);
        course.currentStudents = course.enrolledStudents.length;

        student.updatedAt = new Date();
        course.updatedAt = new Date();

        results.success.push(studentId);
      } catch (error) {
        results.failed.push({ studentId, error: 'Unexpected error' });
      }
    });

    return of(results).pipe(delay(2000));
  }

  bulkUpdateCourseStatus(courseIds: string[], status: 'active' | 'inactive' | 'suspended'): Observable<{ updated: number, failed: number }> {
    let updated = 0;
    let failed = 0;

    courseIds.forEach(courseId => {
      const courseIndex = this.courses.findIndex(c => c.id === courseId);
      if (courseIndex !== -1) {
        this.courses[courseIndex].status = status;
        this.courses[courseIndex].updatedAt = new Date();
        updated++;
      } else {
        failed++;
      }
    });

    return of({ updated, failed }).pipe(delay(1500));
  }

  // ===== NOTIFICATION METHODS (for future implementation) =====

  getNotifications(userId: string): Observable<any[]> {
    // Mock notifications based on user role and data
    const user = this.users.find(u => u.id === userId);
    const notifications: any[] = [];

    if (user?.role === UserRole.ADMIN) {
      // Admin notifications
      const pendingInvoices = this.invoices.filter(i => i.status === 'pending').length;
      if (pendingInvoices > 0) {
        notifications.push({
          id: '1',
          type: 'warning',
          title: 'Pending Invoices',
          message: `${pendingInvoices} invoices are pending payment`,
          timestamp: new Date(),
          read: false
        });
      }

      const nearCapacityCourses = this.courses.filter(c =>
        c.currentStudents / c.maxStudents >= 0.9
      ).length;
      if (nearCapacityCourses > 0) {
        notifications.push({
          id: '2',
          type: 'info',
          title: 'Courses Near Capacity',
          message: `${nearCapacityCourses} courses are near maximum capacity`,
          timestamp: new Date(),
          read: false
        });
      }
    }

    if (user?.role === UserRole.PARENT) {
      // Parent notifications
      const parentInvoices = this.invoices.filter(i =>
        i.parentId === userId && i.status === 'pending'
      ).length;
      if (parentInvoices > 0) {
        notifications.push({
          id: '3',
          type: 'warning',
          title: 'Payment Due',
          message: `You have ${parentInvoices} pending invoice(s)`,
          timestamp: new Date(),
          read: false
        });
      }
    }

    return of(notifications).pipe(delay(300));
  }

  markNotificationAsRead(notificationId: string): Observable<void> {
    // Mock notification update
    return of(void 0).pipe(delay(200));
  }

  // ===== SCHEDULE CONFLICT DETECTION =====

  checkScheduleConflicts(
    classroomId: string,
    schedule: { dayOfWeek: number; startTime: string; endTime: string }[],
    excludeCourseId?: string
  ): Observable<{ hasConflict: boolean; conflictingCourses: Course[] }> {

    const conflictingCourses: Course[] = [];

    for (const scheduleSlot of schedule) {
      const conflicting = this.courses.filter(course => {
        // Skip the course being updated
        if (excludeCourseId && course.id === excludeCourseId) return false;

        // Only check courses in the same classroom
        if (course.classroomId !== classroomId) return false;

        // Check for time conflicts on the same day
        return course.schedule.some(courseSlot => {
          if (courseSlot.dayOfWeek !== scheduleSlot.dayOfWeek) return false;

          const slotStart = this.timeToMinutes(scheduleSlot.startTime);
          const slotEnd = this.timeToMinutes(scheduleSlot.endTime);
          const courseStart = this.timeToMinutes(courseSlot.startTime);
          const courseEnd = this.timeToMinutes(courseSlot.endTime);

          // Check for overlap
          return (slotStart < courseEnd && slotEnd > courseStart);
        });
      });

      conflictingCourses.push(...conflicting);
    }

    // Remove duplicates
    const uniqueConflicts = conflictingCourses.filter((course, index, self) =>
      index === self.findIndex(c => c.id === course.id)
    );

    return of({
      hasConflict: uniqueConflicts.length > 0,
      conflictingCourses: uniqueConflicts
    }).pipe(delay(500));
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // ===== BACKUP AND RESTORE (for development) =====

  exportData(): Observable<any> {
    const data = {
      users: this.users,
      students: this.students,
      mentors: this.mentors,
      courses: this.courses,
      classrooms: this.classrooms,
      invoices: this.invoices,
      exportDate: new Date()
    };

    return of(data).pipe(delay(1000));
  }

  importData(data: any): Observable<void> {
    if (data.users) this.users = data.users;
    if (data.students) this.students = data.students;
    if (data.mentors) this.mentors = data.mentors;
    if (data.courses) this.courses = data.courses;
    if (data.classrooms) this.classrooms = data.classrooms;
    if (data.invoices) this.invoices = data.invoices;

    return of(void 0).pipe(delay(1000));
  }

  resetData(): Observable<void> {
    // Reset to initial state
    this.users.splice(3); // Keep only first 3 users
    this.students.splice(2); // Keep only first 2 students
    this.mentors.splice(1); // Keep only first mentor
    this.courses.splice(2); // Keep only first 2 courses
    this.invoices.splice(1); // Keep only first invoice

    return of(void 0).pipe(delay(500));
  }


getInvoicesByStatus(status: InvoiceStatus): Observable<Invoice[]> {
  return of(this.invoices.filter(i => i.status === status)).pipe(delay(500));
}

updateInvoiceStatus(id: string, status: InvoiceStatus, userId: string, comment?: string): Observable<Invoice> {
  const index = this.invoices.findIndex(i => i.id === id);
  if (index === -1) {
    return throwError(() => new Error('Invoice not found'));
  }

  const invoice = this.invoices[index];
  const user = this.users.find(u => u.id === userId);
  const userName = user ? `${user.firstName} ${user.lastName}` : 'System';

  // Update status
  invoice.status = status;
  invoice.lastModified = new Date();
  invoice.lastModifiedBy = userId;
  invoice.updatedAt = new Date();

  // Add system comment if status change comment provided
  if (comment) {
    const statusComment: InvoiceComment = {
      id: this.generateId(),
      comment,
      createdAt: new Date(),
      createdBy: userId,
      createdByName: userName,
      type: CommentType.SYSTEM
    };
    invoice.comments.push(statusComment);
  }

  // Set payment date if marked as paid
  if (status === InvoiceStatus.PAID && !invoice.paymentDate) {
    invoice.paymentDate = new Date();
  }

  this.invoices[index] = invoice;
  return of(invoice).pipe(delay(1000));
}

addInvoiceComment(invoiceId: string, comment: string, type: CommentType, userId: string, userName: string): Observable<Invoice> {
  const index = this.invoices.findIndex(i => i.id === invoiceId);
  if (index === -1) {
    return throwError(() => new Error('Invoice not found'));
  }

  const invoice = this.invoices[index];
  const newComment: InvoiceComment = {
    id: this.generateId(),
    comment,
    createdAt: new Date(),
    createdBy: userId,
    createdByName: userName,
    type
  };

  invoice.comments.push(newComment);
  invoice.updatedAt = new Date();
  this.invoices[index] = invoice;

  return of(invoice).pipe(delay(500));
}

recordPayment(invoiceId: string, payment: Omit<PaymentRecord, 'id' | 'createdAt'>): Observable<Invoice> {
  const invoiceIndex = this.invoices.findIndex(i => i.id === invoiceId);
  if (invoiceIndex === -1) {
    return throwError(() => new Error('Invoice not found'));
  }

  const invoice = this.invoices[invoiceIndex];

  // Create payment record
  const newPayment: PaymentRecord = {
    ...payment,
    id: this.generateId(),
    createdAt: new Date()
  };

  // Add to payment history (you'd need to add this array to your fake data)
  if (!this.payments) {
    this.payments = [];
  }
  this.payments.push(newPayment);

  // Calculate total paid
  const totalPaid = this.payments
    .filter(p => p.invoiceId === invoiceId)
    .reduce((sum, p) => sum + p.amount, 0);

  // Update invoice status based on payment
  if (totalPaid >= invoice.amount) {
    invoice.status = InvoiceStatus.PAID;
    invoice.paymentDate = new Date();
  } else if (totalPaid > 0) {
    invoice.status = InvoiceStatus.PARTIAL;
  }

  // Add payment comment
  const user = this.users.find(u => u.id === payment.createdBy);
  const userName = user ? `${user.firstName} ${user.lastName}` : 'System';

  const paymentComment: InvoiceComment = {
    id: this.generateId(),
    comment: `Payment of ${payment.amount} received via ${payment.paymentMethod}${payment.reference ? ` (Ref: ${payment.reference})` : ''}`,
    createdAt: new Date(),
    createdBy: payment.createdBy,
    createdByName: userName,
    type: CommentType.PAYMENT
  };

  invoice.comments.push(paymentComment);
  invoice.updatedAt = new Date();
  this.invoices[invoiceIndex] = invoice;

  return of(invoice).pipe(delay(1000));
}

getPaymentHistory(invoiceId?: string): Observable<PaymentRecord[]> {
  if (!this.payments) {
    this.payments = [];
  }

  const payments = invoiceId
    ? this.payments.filter(p => p.invoiceId === invoiceId)
    : this.payments;

  return of(payments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())).pipe(delay(500));
}

sendInvoiceReminder(invoiceId: string): Observable<boolean> {
  const invoice = this.invoices.find(i => i.id === invoiceId);
  if (!invoice) {
    return throwError(() => new Error('Invoice not found'));
  }

  // Add reminder comment
  const reminderComment: InvoiceComment = {
    id: this.generateId(),
    comment: 'Payment reminder sent to parent',
    createdAt: new Date(),
    createdBy: 'system',
    createdByName: 'System',
    type: CommentType.REMINDER
  };

  invoice.comments.push(reminderComment);
  invoice.updatedAt = new Date();

  // Simulate sending reminder
  return of(true).pipe(delay(1000));
}

  // Add missing property for payments
  private payments: PaymentRecord[] = [];

  // Helper method to generate IDs
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  getBillingStats(startDate: Date, endDate: Date): Observable<any> {
    // Filter invoices within date range
    const filteredInvoices = this.invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.issueDate);
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });

    const stats = {
      totalInvoices: filteredInvoices.length,
      totalAmount: filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0),
      paidAmount: filteredInvoices
        .filter(inv => inv.status === InvoiceStatus.PAID)
        .reduce((sum, inv) => sum + inv.amount, 0),
      pendingAmount: filteredInvoices
        .filter(inv => inv.status === InvoiceStatus.PENDING)
        .reduce((sum, inv) => sum + inv.amount, 0),
      overdueAmount: filteredInvoices
        .filter(inv => inv.status === InvoiceStatus.PENDING && new Date(inv.dueDate) < new Date())
        .reduce((sum, inv) => sum + inv.amount, 0),
      paidCount: filteredInvoices.filter(inv => inv.status === InvoiceStatus.PAID).length,
      pendingCount: filteredInvoices.filter(inv => inv.status === InvoiceStatus.PENDING).length,
      overdueCount: filteredInvoices.filter(inv => inv.status === InvoiceStatus.PENDING && new Date(inv.dueDate) < new Date()).length
    };

    return of(stats).pipe(delay(500));
  }

  generateMonthlyInvoices(month: number, year: number): Observable<Invoice[]> {
    // Implementation for generating monthly invoices
    return of([]);
  }

  getClassroomSchedule(classroomId: string): Observable<ClassroomSchedule[]> {
    // Mock schedule data - you can expand this with real data
    const mockSchedule: ClassroomSchedule[] = [
      {
        id: '1',
        classroomId: classroomId,
        courseId: '1',
        courseName: 'Advanced Mathematics',
        mentorName: 'John Mentor',
        dayOfWeek: 1, // Monday
        startTime: '10:00',
        endTime: '11:30',
        isRecurring: true
      },
      {
        id: '2',
        classroomId: classroomId,
        courseId: '2',
        courseName: 'Physics Fundamentals',
        mentorName: 'John Mentor',
        dayOfWeek: 3, // Wednesday
        startTime: '14:00',
        endTime: '15:30',
        isRecurring: true
      },
      {
        id: '3',
        classroomId: classroomId,
        courseId: '3',
        courseName: 'Chemistry Lab',
        mentorName: 'Jane Chemistry',
        dayOfWeek: 2, // Tuesday
        startTime: '09:00',
        endTime: '10:30',
        isRecurring: true
      },
      {
        id: '4',
        classroomId: classroomId,
        courseId: '4',
        courseName: 'Biology Workshop',
        mentorName: 'Dr. Smith',
        dayOfWeek: 4, // Thursday
        startTime: '13:00',
        endTime: '14:30',
        isRecurring: true
      }
    ];

    // Filter by classroom ID and return some sample data
    return of(mockSchedule.filter(s => s.classroomId === classroomId || Math.random() > 0.5)).pipe(delay(500));
  }

  checkClassroomAvailability(classroomId: string, dayOfWeek: number, startTime: string, endTime: string): Observable<boolean> {
    return this.getClassroomSchedule(classroomId).pipe(
      map(schedule => {
        // Check for time conflicts
        const conflictingSlots = schedule.filter(slot => {
          if (slot.dayOfWeek !== dayOfWeek) return false;

          // Convert times to minutes for easier comparison
          const slotStart = this.timeToMinutes(slot.startTime);
          const slotEnd = this.timeToMinutes(slot.endTime);
          const requestStart = this.timeToMinutes(startTime);
          const requestEnd = this.timeToMinutes(endTime);

          // Check for overlap
          return (requestStart < slotEnd && requestEnd > slotStart);
        });

        return conflictingSlots.length === 0;
      }),
      delay(800) // Simulate API delay
    );
  }

}
