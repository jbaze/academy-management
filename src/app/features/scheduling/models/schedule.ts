export interface Schedule {
  id: string;
  courseId: string;
  courseName: string;
  mentorId: string;
  mentorName: string;
  classroomId: string;
  classroomName: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number; // every N days/weeks/months
  daysOfWeek?: number[]; // for weekly pattern
  endType: 'never' | 'count' | 'date';
  count?: number; // number of occurrences
  endDate?: Date;
}

export interface TimeSlot {
  id: string;
  scheduleId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'postponed';
  attendanceCount?: number;
  notes?: string;
}

export interface ScheduleConflict {
  id: string;
  type: 'mentor' | 'classroom' | 'student';
  conflictingSchedules: Schedule[];
  description: string;
  severity: 'high' | 'medium' | 'low';
  isResolved: boolean;
  createdAt: Date;
}
