export interface StudentProgress {
  id: string;
  studentId: string;
  courseId: string;
  courseName: string;
  mentorId: string;
  mentorName: string;
  overallGrade: number;
  letterGrade: string;
  attendanceRate: number;
  assignments: Assignment[];
  assessments: Assessment[];
  milestones: Milestone[];
  notes: ProgressNote[];
  lastUpdated: Date;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  submittedDate?: Date;
  grade?: number;
  maxGrade: number;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  feedback?: string;
  type: 'homework' | 'project' | 'quiz' | 'exam';
}

export interface Assessment {
  id: string;
  title: string;
  date: Date;
  type: 'quiz' | 'test' | 'midterm' | 'final' | 'project';
  grade: number;
  maxGrade: number;
  weightage: number;
  topics: string[];
  feedback: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  progress: number; // 0-100
}

export interface ProgressNote {
  id: string;
  date: Date;
  author: string;
  type: 'general' | 'improvement' | 'achievement' | 'concern';
  content: string;
  isPrivate: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}
