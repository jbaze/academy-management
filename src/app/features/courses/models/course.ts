export interface Course {
  id: string;
  name: string;
  description: string;
  mentorId: string;
  classroomId: string;
  duration: number; // in weeks
  maxStudents: number;
  currentStudents: number;
  enrolledStudents: string[];
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  status: 'active' | 'inactive' | 'suspended';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
