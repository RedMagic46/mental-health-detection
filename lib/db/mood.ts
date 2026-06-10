import { supabaseAdmin } from '../supabase';
import type { MoodLog } from '../types';
import { toMoodLog } from './mappers';

export const moodRepo = {
  async create(data: Omit<MoodLog, 'id' | 'createdAt'>): Promise<MoodLog> {
    const { data: newMood, error } = await supabaseAdmin
      .from('mood_logs')
      .insert({
        user_id: data.userId,
        mood: data.mood,
        mood_value: data.moodValue,
      })
      .select('id, user_id, mood, mood_value, created_at')
      .single();

    if (error) {
      throw new Error(`Failed to create mood log: ${error.message}`);
    }

    return toMoodLog(newMood);
  },

  async findByUserId(userId: string, limit: number = 7): Promise<MoodLog[]> {
    const { data, error } = await supabaseAdmin
      .from('mood_logs')
      .select('id, user_id, mood, mood_value, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map(toMoodLog).reverse();
  },

  async findTodayMood(userId: string): Promise<MoodLog | undefined> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { data, error } = await supabaseAdmin
      .from('mood_logs')
      .select('id, user_id, mood, mood_value, created_at')
      .eq('user_id', userId)
      .gte('created_at', startOfToday.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return undefined;
    return toMoodLog(data[0]);
  },

  async update(id: string, data: Partial<Omit<MoodLog, 'id' | 'userId' | 'createdAt'>>): Promise<MoodLog | undefined> {
    const updateData: any = {};
    if (data.mood) updateData.mood = data.mood;
    if (data.moodValue !== undefined) updateData.mood_value = data.moodValue;

    const { data: updated, error } = await supabaseAdmin
      .from('mood_logs')
      .update(updateData)
      .eq('id', id)
      .select('id, user_id, mood, mood_value, created_at')
      .single();

    if (error || !updated) return undefined;
    return toMoodLog(updated);
  },
};
