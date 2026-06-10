import { supabaseAdmin } from '../supabase';
import type { Question } from '../types';
import { toQuestion } from './mappers';

export const questionRepo = {
  async findAll(): Promise<Question[]> {
    const { data, error } = await supabaseAdmin
      .from('questions')
      .select('id, text, category, weight, created_at')
      .order('id', { ascending: true });

    if (error || !data) return [];
    return data.map(toQuestion);
  },

  async findById(id: number): Promise<Question | undefined> {
    const { data, error } = await supabaseAdmin
      .from('questions')
      .select('id, text, category, weight, created_at')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return toQuestion(data);
  },

  async create(data: Omit<Question, 'id' | 'createdAt'>): Promise<Question> {
    const { data: newQuestion, error } = await supabaseAdmin
      .from('questions')
      .insert({
        text: data.text,
        category: data.category,
        weight: data.weight,
      })
      .select('id, text, category, weight, created_at')
      .single();

    if (error) {
      throw new Error(`Failed to create question: ${error.message}`);
    }

    return toQuestion(newQuestion);
  },

  async update(id: number, data: Partial<Omit<Question, 'id' | 'createdAt'>>): Promise<Question | undefined> {
    const { data: updatedQuestion, error } = await supabaseAdmin
      .from('questions')
      .update(data)
      .eq('id', id)
      .select('id, text, category, weight, created_at')
      .single();

    if (error || !updatedQuestion) return undefined;
    return toQuestion(updatedQuestion);
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
      .select('id', { count: 'exact', head: true });
    
    if (error) return 0;
    return count || 0;
  },
};
