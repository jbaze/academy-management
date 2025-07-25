export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  location: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassroomSchedule {
  id: string;
  classroomId: string;
  courseId: string;
  courseName: string;
  mentorName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}
