import { supabaseAdmin } from '../supabase';
import type { Assessment, SafeUser } from '../types';
import { toAssessment } from './mappers';

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
      .select('id, user_id, answers, score, label, recommendation, created_at')
      .single();

    if (error) {
      throw new Error(`Failed to create assessment: ${error.message}`);
    }

    return toAssessment(newAssessment);
  },

  async findByUserId(userId: string): Promise<Assessment[]> {
    const { data, error } = await supabaseAdmin
      .from('assessments')
      .select('id, user_id, answers, score, label, recommendation, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(toAssessment);
  },

  async count(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('assessments')
      .select('id', { count: 'exact', head: true });
    
    if (error) return 0;
    return count || 0;
  },

  async findAll(): Promise<(Assessment & { user?: SafeUser })[]> {
    const { data, error } = await supabaseAdmin
      .from('assessments')
      .select('id, user_id, answers, score, label, recommendation, created_at, users(id, name, email, role, created_at)')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((a: any) => ({
      ...toAssessment(a),
      user: a.users ? {
        id: a.users.id,
        name: a.users.name,
        email: a.users.email,
        role: a.users.role,
        createdAt: a.users.created_at,
        lastActiveAt: a.users.last_active_at || null
      } : undefined
    }));
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('assessments')
      .delete()
      .eq('id', id);
    return !error;
  },
};
