export type UserRole = 'user' | 'admin' | 'consultant';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  lastActiveAt: string | null;
}

export type SafeUser = Omit<User, 'passwordHash'>;

export interface Assessment {
  id: string;
  userId: string | null;
  answers: Record<number, number>;
  score: number;
  label: 'normal' | 'at_risk' | 'critical';
  recommendation: string;
  createdAt: string;
}

export type ConsultationStatus = 'new' | 'in_progress' | 'done';

export interface Consultation {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  message: string;
  status: ConsultationStatus;
  createdAt: string;
  assignedConsultantId?: string | null;
  internalNotes?: string | null;
}

export interface ChatMessage {
  id: string;
  consultationId: string;
  senderId: string;
  senderRole: 'user' | 'admin' | 'consultant';
  message: string;
  createdAt: string;
}

export interface MoodLog {
  id: string;
  userId: string;
  mood: 'good' | 'neutral' | 'bad';
  moodValue: number;
  createdAt: string;
}

export interface Question {
  id: number;
  text: string;
  category: string;
  weight: number;
  createdAt: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface PasswordReset {
  id: string;
  email: string;
  otp: string;
  expiresAt: string;
  createdAt: string;
}

export interface AssessmentConfig {
  id: string;
  displayCount: number;
  selectionMode: 'manual' | 'random';
  manualQuestionIds: number[];
  randomizeOrder: boolean;
}

export interface SuccessStory {
  id: number;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  rating: number;
  createdAt: string;
}

export interface CommunityForum {
  id: number;
  title: string;
  icon: string;
  link: string;
  createdAt: string;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  createdAt: string;
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  category: string;
  userId: string;
  userName?: string;
  isAnonymous: boolean;
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser?: boolean;
  isPrivate: boolean;
  createdAt: string;
}

export interface ForumComment {
  id: string;
  threadId: string;
  content: string;
  userId: string;
  userName?: string;
  isAnonymous: boolean;
  createdAt: string;
}
