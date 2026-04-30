// ============================================================
// Core data types for MindCare Mental Health Detection
// ============================================================

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

/** Safe user object without sensitive data */
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
