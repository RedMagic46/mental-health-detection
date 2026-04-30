// ============================================================
// Supabase Repository Implementation
// ============================================================

import { supabaseAdmin } from './supabase';
import type { User, Assessment, Consultation, Question } from './types';

// ============================================================
// USER repository
// ============================================================
export const userRepo = {
  async findByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return undefined;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      passwordHash: data.password_hash,
      role: data.role,
      createdAt: data.created_at,
    };
  },

  async findById(id: string): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      passwordHash: data.password_hash,
      role: data.role,
      createdAt: data.created_at,
    };
  },

  async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        name: data.name,
        email: data.email,
        password_hash: data.passwordHash,
        role: data.role,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create user: ${error.message}`);

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      passwordHash: newUser.password_hash,
      role: newUser.role,
      createdAt: newUser.created_at,
    };
  },

  async count(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) return 0;
    return count || 0;
  },
};

// ============================================================
// ASSESSMENT repository
// ============================================================
export const assessmentRepo = {
  async create(data: Omit<Assessment, 'id' | 'createdAt'>): Promise<Assessment> {
    const { data: newAssessment, error } = await supabaseAdmin
      .from('assessments')
      .insert({
        user_id: data.userId,
        answers: data.answers,
        score: data.score,
        label: data.label,
        recommendation: data.recommendation,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create assessment: ${error.message}`);

    return {
      id: newAssessment.id,
      userId: newAssessment.user_id,
      answers: newAssessment.answers,
      score: newAssessment.score,
      label: newAssessment.label,
      recommendation: newAssessment.recommendation,
      createdAt: newAssessment.created_at,
    };
  },

  async findByUserId(userId: string): Promise<Assessment[]> {
    const { data, error } = await supabaseAdmin
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];

    return data.map((a) => ({
      id: a.id,
      userId: a.user_id,
      answers: a.answers,
      score: a.score,
      label: a.label,
      recommendation: a.recommendation,
      createdAt: a.created_at,
    }));
  },

  async count(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('assessments')
      .select('*', { count: 'exact', head: true });
    
    if (error) return 0;
    return count || 0;
  },
};

// ============================================================
// CONSULTATION repository
// ============================================================
export const consultationRepo = {
  async create(data: Omit<Consultation, 'id' | 'createdAt'>): Promise<Consultation> {
    const { data: newConsultation, error } = await supabaseAdmin
      .from('consultations')
      .insert({
        user_id: data.userId,
        name: data.name,
        email: data.email,
        message: data.message,
        status: data.status,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create consultation: ${error.message}`);

    return {
      id: newConsultation.id,
      userId: newConsultation.user_id,
      name: newConsultation.name,
      email: newConsultation.email,
      message: newConsultation.message,
      status: newConsultation.status,
      createdAt: newConsultation.created_at,
    };
  },

  async findAll(): Promise<Consultation[]> {
    const { data, error } = await supabaseAdmin
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];

    return data.map((c) => ({
      id: c.id,
      userId: c.user_id,
      name: c.name,
      email: c.email,
      message: c.message,
      status: c.status,
      createdAt: c.created_at,
    }));
  },

  async findById(id: string): Promise<Consultation | undefined> {
    const { data, error } = await supabaseAdmin
      .from('consultations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      email: data.email,
      message: data.message,
      status: data.status,
      createdAt: data.created_at,
    };
  },

  async updateStatus(id: string, status: Consultation['status']): Promise<Consultation | undefined> {
    const { data, error } = await supabaseAdmin
      .from('consultations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      email: data.email,
      message: data.message,
      status: data.status,
      createdAt: data.created_at,
    };
  },

  async count(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('consultations')
      .select('*', { count: 'exact', head: true });
    
    if (error) return 0;
    return count || 0;
  },

  async countByStatus(status: Consultation['status']): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);
    
    if (error) return 0;
    return count || 0;
  },
};

// ============================================================
// QUESTION repository
// ============================================================
export const questionRepo = {
  async findAll(): Promise<Question[]> {
    const { data, error } = await supabaseAdmin
      .from('questions')
      .select('*')
      .order('id', { ascending: true });

    if (error) return [];

    return data.map((q) => ({
      id: q.id,
      text: q.text,
      category: q.category,
      weight: q.weight,
      createdAt: q.created_at,
    }));
  },

  async findById(id: number): Promise<Question | undefined> {
    const { data, error } = await supabaseAdmin
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    return {
      id: data.id,
      text: data.text,
      category: data.category,
      weight: data.weight,
      createdAt: data.created_at,
    };
  },

  async create(data: Omit<Question, 'id' | 'createdAt'>): Promise<Question> {
    const { data: newQuestion, error } = await supabaseAdmin
      .from('questions')
      .insert({
        text: data.text,
        category: data.category,
        weight: data.weight,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create question: ${error.message}`);

    return {
      id: newQuestion.id,
      text: newQuestion.text,
      category: newQuestion.category,
      weight: newQuestion.weight,
      createdAt: newQuestion.created_at,
    };
  },

  async update(id: number, data: Partial<Omit<Question, 'id' | 'createdAt'>>): Promise<Question | undefined> {
    const { data: updatedQuestion, error } = await supabaseAdmin
      .from('questions')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedQuestion) return undefined;

    return {
      id: updatedQuestion.id,
      text: updatedQuestion.text,
      category: updatedQuestion.category,
      weight: updatedQuestion.weight,
      createdAt: updatedQuestion.created_at,
    };
  },

  async delete(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('questions')
      .delete()
      .eq('id', id);

    return !error;
  },

  async count(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('questions')
      .select('*', { count: 'exact', head: true });
    
    if (error) return 0;
    return count || 0;
  },
};
