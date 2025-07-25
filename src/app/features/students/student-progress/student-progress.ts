import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StudentProgressService } from '../services/student-progress';
import { StudentService } from '../services/student';
import { Auth } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { StudentProgress, Assignment, Assessment, AttendanceRecord, ProgressNote } from '../models/progress';
import { Student } from '../models/student';
import { UserRole } from '../../../core/models/role';

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './student-progress.html',
  styleUrl: './student-progress.scss'
})
export class StudentProgressComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private progressService = inject(StudentProgressService);
  private studentService = inject(StudentService);
  private authService = inject(Auth);
  private notificationService = inject(NotificationService);
  private formBuilder = inject(FormBuilder);

  student = signal<Student | null>(null);
  progressData = signal<StudentProgress[]>([]);
  selectedCourseProgress = signal<StudentProgress | null>(null);
  attendanceRecords = signal<AttendanceRecord[]>([]);
  gradeTrend = signal<{ date: Date, grade: number }[]>([]);
  loading = signal(false);
  showAddNoteForm = signal(false);

  // Form for adding notes
  noteForm: FormGroup;

  // Computed properties
  currentUser = computed(() => this.authService.getCurrentUser());
  canEdit = computed(() => {
    const user = this.currentUser();
    return user?.role === UserRole.ADMIN || user?.role === UserRole.MENTOR;
  });

  // Tab management
  activeTab = signal<'overview' | 'assignments' | 'assessments' | 'attendance' | 'notes'>('overview');

  // Statistics
  overallStats = computed(() => {
    const progress = this.progressData();
    if (progress.length === 0) return null;

    const totalGrades = progress.reduce((sum, p) => sum + p.overallGrade, 0);
    const avgGrade = totalGrades / progress.length;
    const totalAttendance = progress.reduce((sum, p) => sum + p.attendanceRate, 0);
    const avgAttendance = totalAttendance / progress.length;

    return {
      averageGrade: avgGrade,
      averageAttendance: avgAttendance,
      totalCourses: progress.length,
      completedAssignments: progress.reduce((sum, p) =>
        sum + p.assignments.filter(a => a.status === 'graded').length, 0
      ),
      totalAssignments: progress.reduce((sum, p) => sum + p.assignments.length, 0)
    };
  });

  constructor() {
    this.noteForm = this.formBuilder.group({
      type: ['general', Validators.required],
      content: ['', [Validators.required, Validators.maxLength(500)]],
      isPrivate: [false]
    });
  }

  ngOnInit(): void {
    const studentId = this.route.snapshot.paramMap.get('id');
    if (studentId) {
      this.loadStudentData(studentId);
    }
  }

  private loadStudentData(studentId: string): void {
    this.loading.set(true);

    // Load student info
    this.studentService.getStudentById(studentId).subscribe({
      next: (student) => {
        if (student) {
          this.student.set(student);
          this.loadProgressData(studentId);
        }
      },
      error: () => {
        this.notificationService.showError('Failed to load student information');
        this.loading.set(false);
      }
    });
  }

  private loadProgressData(studentId: string): void {
    this.progressService.getStudentProgress(studentId).subscribe({
      next: (progress) => {
        this.progressData.set(progress);
        if (progress.length > 0) {
          this.selectedCourseProgress.set(progress[0]);
          this.loadCourseSpecificData(studentId, progress[0].courseId);
        }
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load progress data');
        this.loading.set(false);
      }
    });
  }

  private loadCourseSpecificData(studentId: string, courseId: string): void {
    // Load attendance records
    this.progressService.getAttendanceRecords(studentId, courseId).subscribe({
      next: (records) => this.attendanceRecords.set(records)
    });

    // Load grade trend
    this.progressService.getGradeTrend(studentId, courseId).subscribe({
      next: (trend) => this.gradeTrend.set(trend)
    });
  }

  selectCourse(progress: StudentProgress): void {
    this.selectedCourseProgress.set(progress);
    const studentId = this.student()?.id;
    if (studentId) {
      this.loadCourseSpecificData(studentId, progress.courseId);
    }
    this.activeTab.set('overview');
  }

  setActiveTab(tab: 'overview' | 'assignments' | 'assessments' | 'attendance' | 'notes'): void {
    this.activeTab.set(tab);
  }

  getGradeColor(grade: number): string {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  }

  getGradeBgColor(grade: number): string {
    if (grade >= 90) return 'bg-green-100';
    if (grade >= 80) return 'bg-blue-100';
    if (grade >= 70) return 'bg-yellow-100';
    if (grade >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  }

  getAssignmentStatusColor(status: string): string {
    switch (status) {
      case 'graded': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'late': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getAttendanceStatusColor(status: string): string {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getMilestoneStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getNoteTypeIcon(type: string): string {
    switch (type) {
      case 'achievement': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'improvement': return 'M13 10V3L4 14h7v7l9-11h-7z';
      case 'concern': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z';
      default: return 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z';
    }
  }

 _toggleAddNoteForm(): void {
    this.showAddNoteForm.set(!this.showAddNoteForm());
    if (!this.showAddNoteForm()) {
      this.noteForm.reset({ type: 'general', isPrivate: false });
    }
  }

  onSubmitNote(): void {
    if (this.noteForm.valid && this.selectedCourseProgress()) {
      const studentId = this.student()?.id;
      const courseId = this.selectedCourseProgress()?.courseId;
      const currentUser = this.currentUser();

      if (studentId && courseId && currentUser) {
        const noteData = {
          ...this.noteForm.value,
          date: new Date(),
          author: `${currentUser.firstName} ${currentUser.lastName}`
        };

        this.progressService.addProgressNote(studentId, courseId, noteData).subscribe({
          next: () => {
            this.notificationService.showSuccess('Note added successfully');
            this._toggleAddNoteForm();
            this.loadProgressData(studentId); // Refresh data
          },
          error: () => {
            this.notificationService.showError('Failed to add note');
          }
        });
      }
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString();
  }

  // Chart data for grade trend (for future chart integration)
  getChartData(): any {
    const trend = this.gradeTrend();
    return {
      labels: trend.map(t => this.formatDate(t.date)),
      datasets: [{
        label: 'Grade Trend',
        data: trend.map(t => t.grade),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.1
      }]
    };
  }

  getAge(): number {
    const student = this.student();
    if (!student?.dateOfBirth) {
      return 0;
    }

    const today = new Date();
    const birthDate = new Date(student.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  overallGrade(): string {
    const courseProgress = this.progressData();
    if (!courseProgress || courseProgress.length === 0) {
      return 'N/A';
    }

    const totalGrades = courseProgress.reduce((sum, course) => {
      return sum + course.overallGrade;
    }, 0);

    const averageGrade = totalGrades / courseProgress.length;
    return this.convertNumberToGrade(averageGrade);
  }

  private convertGradeToNumber(grade: string): number {
    const gradeMap: { [key: string]: number } = {
      'A+': 97, 'A': 93, 'A-': 90,
      'B+': 87, 'B': 83, 'B-': 80,
      'C+': 77, 'C': 73, 'C-': 70,
      'D+': 67, 'D': 63, 'D-': 60,
      'F': 50
    };
    return gradeMap[grade] || 0;
  }

  private convertNumberToGrade(num: number): string {
    if (num >= 97) return 'A+';
    if (num >= 93) return 'A';
    if (num >= 90) return 'A-';
    if (num >= 87) return 'B+';
    if (num >= 83) return 'B';
    if (num >= 80) return 'B-';
    if (num >= 77) return 'C+';
    if (num >= 73) return 'C';
    if (num >= 70) return 'C-';
    if (num >= 67) return 'D+';
    if (num >= 63) return 'D';
    if (num >= 60) return 'D-';
    return 'F';
  }

  attendedClasses(): number {
    const records = this.attendanceRecords();
    if (!records || records.length === 0) {
      return 0;
    }
    return records.filter(record => record.status === 'present' || record.status === 'excused').length;
  }

  attendanceRate(): number {
    const records = this.attendanceRecords();
    if (!records || records.length === 0) {
      return 0;
    }
    const attended = this.attendedClasses();
    return (attended / records.length) * 100;
  }

  completedAssignments(): number {
    const progress = this.progressData();
    if (!progress || progress.length === 0) {
      return 0;
    }
    return progress.reduce((sum, course) =>
      sum + course.assignments.filter(a => a.status === 'graded').length, 0
    );
  }

  totalAssignments(): number {
    const progress = this.progressData();
    if (!progress || progress.length === 0) {
      return 0;
    }
    return progress.reduce((sum, course) => sum + course.assignments.length, 0);
  }

  exportProgress(): void {
    // TODO: Implement progress export functionality
    console.log('Exporting progress report...');
  }

  addProgressEntry(): void {
    // TODO: Implement add progress entry functionality
    console.log('Add progress entry clicked');
  }

  completionRate(): number {
    const total = this.totalAssignments();
    const completed = this.completedAssignments();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  totalClasses(): number {
    const records = this.attendanceRecords();
    return records ? records.length : 0;
  }

  improvementTrend(): string {
    const trend = this.gradeTrend();
    if (trend.length < 2) return 'N/A';

    const recent = trend.slice(-2);
    const change = recent[1].grade - recent[0].grade;

    if (change > 5) return '+' + change.toFixed(1) + '%';
    if (change < -5) return change.toFixed(1) + '%';
    return 'Stable';
  }

  getTrendClass(): string {
    const trend = this.improvementTrend();
    if (trend.startsWith('+')) return 'text-green-600';
    if (trend.startsWith('-')) return 'text-red-600';
    return 'text-gray-600';
  }

  courseProgressData() {
    return this.progressData().map(progress => ({
      courseName: progress.courseName,
      mentorName: progress.mentorName,
      currentGrade: this.convertNumberToGrade(progress.overallGrade),
      completionPercentage: this.calculateCourseCompletion(progress),
      completedAssignments: progress.assignments.filter(a => a.status === 'graded').length,
      totalAssignments: progress.assignments.length,
      attendanceRate: progress.attendanceRate,
      lastQuizScore: this.getLastQuizScore(progress),
      nextAssignment: this.getNextAssignmentDate(progress)
    }));
  }

  private calculateCourseCompletion(progress: StudentProgress): number {
    const completed = progress.assignments.filter(a => a.status === 'graded').length;
    const total = progress.assignments.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  private getLastQuizScore(progress: StudentProgress): string {
    const quizzes = progress.assessments?.filter(a => a.type === 'quiz') || [];
    if (quizzes.length === 0) return 'N/A';
    const lastQuiz = quizzes[quizzes.length - 1];
    return this.convertNumberToGrade(lastQuiz.grade);
  }

  private getNextAssignmentDate(progress: StudentProgress): Date {
    const pending = progress.assignments.filter(a => a.status === 'pending');
    if (pending.length === 0) return new Date();
    return pending[0].dueDate;
  }

  getGradeClass(grade: string): string {
    const numGrade = this.convertGradeToNumber(grade);
    return this.getGradeColor(numGrade);
  }

  recentActivities() {
    // Mock data - replace with actual service call
    return [
      {
        id: '1',
        type: 'assignment',
        title: 'Math Homework #5',
        description: 'Completed algebra problems',
        date: new Date(),
        score: 'A-'
      },
      {
        id: '2',
        type: 'quiz',
        title: 'Science Quiz',
        description: 'Weekly quiz on photosynthesis',
        date: new Date(Date.now() - 86400000),
        score: 'B+'
      },
      {
        id: '3',
        type: 'attendance',
        title: 'Perfect Attendance',
        description: 'No absences this week',
        date: new Date(Date.now() - 172800000),
        score: null
      }
    ];
  }

  progressTimeline() {
    // Mock data - replace with actual service call
    return [
      {
        id: '1',
        type: 'achievement',
        title: 'Honor Roll',
        description: 'Made honor roll for Q2',
        date: new Date(),
        badge: { text: 'Achievement', class: 'bg-yellow-100 text-yellow-800' }
      },
      {
        id: '2',
        type: 'improvement',
        title: 'Math Grade Improvement',
        description: 'Improved from C+ to B-',
        date: new Date(Date.now() - 604800000),
        badge: { text: 'Improvement', class: 'bg-green-100 text-green-800' }
      }
    ];
  }

  currentGoals() {
    // Mock data - replace with actual service call
    return [
      {
        id: '1',
        title: 'Improve Math Grade',
        description: 'Raise math grade from B- to B+',
        targetDate: new Date(Date.now() + 2592000000),
        progress: 65
      },
      {
        id: '2',
        title: 'Perfect Attendance',
        description: 'Maintain 100% attendance this semester',
        targetDate: new Date(Date.now() + 5184000000),
        progress: 85
      }
    ];
  }

  recommendations() {
    // Mock data - replace with actual service call
    return [
      {
        id: '1',
        title: 'Extra Math Practice',
        description: 'Suggest additional practice problems for algebra',
        priority: 'High',
        mentorName: 'Ms. Johnson'
      },
      {
        id: '2',
        title: 'Reading Comprehension',
        description: 'Focus on improving reading speed and comprehension',
        priority: 'Medium',
        mentorName: 'Mr. Smith'
      }
    ];
  }

  getActivityIconClass(type: string): string {
    const baseClass = 'w-8 h-8 rounded-full flex items-center justify-center ';
    switch (type) {
      case 'assignment': return baseClass + 'bg-blue-100 text-blue-600';
      case 'quiz': return baseClass + 'bg-purple-100 text-purple-600';
      case 'attendance': return baseClass + 'bg-green-100 text-green-600';
      case 'achievement': return baseClass + 'bg-yellow-100 text-yellow-600';
      default: return baseClass + 'bg-gray-100 text-gray-600';
    }
  }

  getScoreBadgeClass(score: string): string {
    const numGrade = this.convertGradeToNumber(score);
    if (numGrade >= 90) return 'bg-green-100 text-green-800';
    if (numGrade >= 80) return 'bg-blue-100 text-blue-800';
    if (numGrade >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  getMilestoneIconClass(type: string): string {
    const baseClass = 'w-8 h-8 rounded-full flex items-center justify-center ';
    switch (type) {
      case 'achievement': return baseClass + 'bg-yellow-100 text-yellow-600';
      case 'improvement': return baseClass + 'bg-green-100 text-green-600';
      case 'goal': return baseClass + 'bg-blue-100 text-blue-600';
      default: return baseClass + 'bg-gray-100 text-gray-600';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  trackByCourse(index: number, item: any): string {
    return item.courseName;
  }

  trackByActivity(index: number, item: any): string {
    return item.id;
  }

  trackByMilestone(index: number, item: any): string {
    return item.id;
  }

  trackByGoal(index: number, item: any): string {
    return item.id;
  }

  trackByRecommendation(index: number, item: any): string {
    return item.id;
  }

  loadMoreActivities(): void {
    // TODO: Implement load more activities
    console.log('Loading more activities...');
  }

  addMilestone(): void {
    // TODO: Implement add milestone functionality
    console.log('Add milestone clicked');
  }

  studentId = computed(() => this.student()?.id || '');
}
