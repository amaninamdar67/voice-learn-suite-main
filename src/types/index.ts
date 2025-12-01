export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent' | 'mentor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  content: string;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quiz {
  id: string;
  title: string;
  lessonId: string;
  questions: QuizQuestion[];
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  teamIds: string[];
  deadline: Date;
}

export interface Team {
  id: string;
  name: string;
  studentIds: string[];
  projectId: string;
}

export interface Discussion {
  id: string;
  lessonId: string;
  userId: string;
  nickname: string;
  message: string;
  createdAt: Date;
}

export interface VoiceSettings {
  voiceType: 'female' | 'male' | 'other';
  speed: number;
  enabled: boolean;
}
