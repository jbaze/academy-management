export interface Curriculum {
  id: string;
  courseId: string;
  name: string;
  description: string;
  duration: number; // in weeks
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  modules: CurriculumModule[];
  prerequisites: string[];
  learningObjectives: string[];
  assessmentMethods: AssessmentMethod[];
  totalLessons: number;
  totalHours: number;
  version: string;
  isActive: boolean;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurriculumModule {
  id: string;
  name: string;
  description: string;
  order: number;
  duration: number; // in hours
  lessons: Lesson[];
  objectives: string[];
  resources: Resource[];
  assessments: Assessment[];
  isRequired: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  duration: number; // in minutes
  type: 'lecture' | 'practical' | 'discussion' | 'assignment' | 'assessment';
  materials: Material[];
  activities: Activity[];
  homework?: Homework;
  learningOutcomes: string[];
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  type: 'individual' | 'group' | 'class';
  duration: number; // in minutes
  instructions: string;
  materials: string[];
  expectedOutcome: string;
}

export interface Material {
  id: string;
  name: string;
  type: 'document' | 'video' | 'audio' | 'link' | 'image' | 'interactive';
  url?: string;
  content?: string;
  isRequired: boolean;
  estimatedTime?: number; // in minutes
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: Date;
  estimatedTime: number; // in minutes
  resources: string[];
  rubric?: AssessmentRubric;
}

export interface Assessment {
  id: string;
  name: string;
  type: 'quiz' | 'test' | 'project' | 'presentation' | 'assignment';
  description: string;
  totalPoints: number;
  passingScore: number;
  duration?: number; // in minutes
  questions?: Question[];
  rubric?: AssessmentRubric;
  isGraded: boolean;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'practical';
  question: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  explanation?: string;
}

export interface AssessmentRubric {
  id: string;
  criteria: RubricCriteria[];
  totalPoints: number;
}

export interface RubricCriteria {
  id: string;
  name: string;
  description: string;
  levels: RubricLevel[];
  weight: number; // percentage
}

export interface RubricLevel {
  id: string;
  name: string;
  description: string;
  points: number;
}

export interface AssessmentMethod {
  type: string;
  percentage: number;
  description: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'book' | 'article' | 'video' | 'website' | 'software' | 'equipment';
  description: string;
  url?: string;
  isRequired: boolean;
  cost?: number;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  curriculumIds: string[];
  prerequisites: string[];
  estimatedDuration: number; // in weeks
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetAudience: string[];
  certificationAvailable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
