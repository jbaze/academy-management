export interface Mentor {
  id: string;
  userId: string;
  specialization: string[];
  experience: number;
  qualifications: string[];
  assignedCourses: string[];
  availableHours: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  hourlyRate: number;
  bio: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
