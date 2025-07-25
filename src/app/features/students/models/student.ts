export interface Student {
  id: string;
  parentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  email?: string;
  phone?: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  enrolledCourses: string[];
  academicLevel: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
