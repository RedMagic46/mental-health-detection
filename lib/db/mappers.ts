import type { 
  User, 
  SafeUser, 
  Assessment, 
  Consultation, 
  ChatMessage, 
  Question, 
  AssessmentConfig, 
  MoodLog, 
  SuccessStory, 
  CommunityForum, 
  Faq, 
  ForumThread, 
  ForumComment 
} from '../types';

export function toUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
    lastActiveAt: row.last_active_at || null,
  };
}

export function toSafeUser(row: any): SafeUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    lastActiveAt: row.last_active_at || null,
  };
}

export function toAssessment(row: any): Assessment {
  return {
    id: row.id,
    userId: row.user_id,
    answers: row.answers,
    score: row.score,
    label: row.label,
    recommendation: row.recommendation,
    createdAt: row.created_at,
  };
}

export function toConsultation(row: any): Consultation {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    assignedConsultantId: row.assigned_consultant_id,
    internalNotes: row.internal_notes,
  };
}

export function toChatMessage(row: any): ChatMessage {
  return {
    id: row.id,
    consultationId: row.consultation_id,
    senderId: row.sender_id,
    senderRole: row.sender_role,
    message: row.message,
    createdAt: row.created_at,
  };
}

export function toQuestion(row: any): Question {
  return {
    id: row.id,
    text: row.text,
    category: row.category,
    weight: row.weight,
    createdAt: row.created_at,
  };
}

export function toSettings(row: any): AssessmentConfig {
  return {
    id: row.id,
    displayCount: row.display_count,
    selectionMode: row.selection_mode,
    manualQuestionIds: row.manual_question_ids || [],
    randomizeOrder: row.randomize_order,
  };
}

export function toMoodLog(row: any): MoodLog {
  return {
    id: row.id,
    userId: row.user_id,
    mood: row.mood,
    moodValue: row.mood_value,
    createdAt: row.created_at,
  };
}

export function toSuccessStory(row: any): SuccessStory {
  return {
    id: Number(row.id),
    title: row.title,
    content: row.content,
    authorName: row.author_name,
    authorRole: row.author_role,
    rating: row.rating,
    createdAt: row.created_at,
  };
}

export function toCommunityForum(row: any): CommunityForum {
  return {
    id: Number(row.id),
    title: row.title,
    icon: row.icon,
    link: row.link,
    createdAt: row.created_at,
  };
}

export function toFaq(row: any): Faq {
  return {
    id: Number(row.id),
    question: row.question,
    answer: row.answer,
    createdAt: row.created_at,
  };
}
