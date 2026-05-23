// ============================================================
// Supabase Repository Implementation
// ============================================================

import { supabaseAdmin } from './supabase';
import type { User, Assessment, Consultation, ChatMessage, Question, AssessmentConfig, MoodLog } from './types';

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

  async update(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | undefined> {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (data.passwordHash) updateData.password_hash = data.passwordHash;

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedUser) return undefined;

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      passwordHash: updatedUser.password_hash,
      role: updatedUser.role,
      createdAt: updatedUser.created_at,
    };
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

  async findByUserId(userId: string): Promise<Consultation[]> {
    const { data, error } = await supabaseAdmin
      .from('consultations')
      .select('*')
      .eq('user_id', userId)
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
// CHAT MESSAGE repository
// ============================================================
export const chatMessageRepo = {
  async create(data: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
    const { data: newMsg, error } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        consultation_id: data.consultationId,
        sender_id: data.senderId,
        sender_role: data.senderRole,
        message: data.message,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create chat message: ${error.message}`);

    return {
      id: newMsg.id,
      consultationId: newMsg.consultation_id,
      senderId: newMsg.sender_id,
      senderRole: newMsg.sender_role,
      message: newMsg.message,
      createdAt: newMsg.created_at,
    };
  },

  async findByConsultationId(consultationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('consultation_id', consultationId)
      .order('created_at', { ascending: true });

    if (error) return [];

    return data.map((m) => ({
      id: m.id,
      consultationId: m.consultation_id,
      senderId: m.sender_id,
      senderRole: m.sender_role,
      message: m.message,
      createdAt: m.created_at,
    }));
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

// ============================================================
// PASSWORD RESET repository
// ============================================================
export const passwordResetRepo = {
  async create(email: string, otp: string, expiresAt: Date) {
    // Delete any existing OTP for this email first
    await this.deleteByEmail(email);

    const { data, error } = await supabaseAdmin
      .from('password_resets')
      .insert({
        email,
        otp,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create password reset: ${error.message}`);
    return data;
  },

  async findValidOTP(email: string, otp: string) {
    const { data, error } = await supabaseAdmin
      .from('password_resets')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) return undefined;
    return data;
  },

  async deleteByEmail(email: string) {
    const { error } = await supabaseAdmin
      .from('password_resets')
      .delete()
      .eq('email', email);
    
    return !error;
  },
};

// ============================================================
// SETTINGS repository
// ============================================================
export const settingsRepo = {
  async getConfig(): Promise<AssessmentConfig> {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('id', 'assessment_config')
      .single();

    if (error || !data) {
      // Default configuration if not found
      return {
        id: 'assessment_config',
        displayCount: 10,
        selectionMode: 'random',
        manualQuestionIds: [],
        randomizeOrder: true,
      };
    }

    return {
      id: data.id,
      displayCount: data.display_count,
      selectionMode: data.selection_mode,
      manualQuestionIds: data.manual_question_ids || [],
      randomizeOrder: data.randomize_order,
    };
  },

  async updateConfig(data: Partial<Omit<AssessmentConfig, 'id'>>): Promise<boolean> {
    const updateData: any = {};
    if (data.displayCount !== undefined) updateData.display_count = data.displayCount;
    if (data.selectionMode !== undefined) updateData.selection_mode = data.selectionMode;
    if (data.manualQuestionIds !== undefined) updateData.manual_question_ids = data.manualQuestionIds;
    if (data.randomizeOrder !== undefined) updateData.randomize_order = data.randomizeOrder;

    const { error } = await supabaseAdmin
      .from('settings')
      .upsert({ id: 'assessment_config', ...updateData });

    return !error;
  },
};

// ============================================================
// MOOD LOG repository
// ============================================================
export const moodRepo = {
  async create(data: Omit<MoodLog, 'id' | 'createdAt'>): Promise<MoodLog> {
    const { data: newMood, error } = await supabaseAdmin
      .from('mood_logs')
      .insert({
        user_id: data.userId,
        mood: data.mood,
        mood_value: data.moodValue,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create mood log: ${error.message}`);

    return {
      id: newMood.id,
      userId: newMood.user_id,
      mood: newMood.mood,
      moodValue: newMood.mood_value,
      createdAt: newMood.created_at,
    };
  },

  async findByUserId(userId: string, limit: number = 7): Promise<MoodLog[]> {
    const { data, error } = await supabaseAdmin
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];

    return data.map((m) => ({
      id: m.id,
      userId: m.user_id,
      mood: m.mood,
      moodValue: m.mood_value,
      createdAt: m.created_at,
    })).reverse();
  },

  async findTodayMood(userId: string): Promise<MoodLog | undefined> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { data, error } = await supabaseAdmin
      .from('mood_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfToday.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return undefined;

    const m = data[0];
    return {
      id: m.id,
      userId: m.user_id,
      mood: m.mood,
      moodValue: m.mood_value,
      createdAt: m.created_at,
    };
  },

  async update(id: string, data: Partial<Omit<MoodLog, 'id' | 'userId' | 'createdAt'>>): Promise<MoodLog | undefined> {
    const updateData: any = {};
    if (data.mood) updateData.mood = data.mood;
    if (data.moodValue !== undefined) updateData.mood_value = data.moodValue;

    const { data: updated, error } = await supabaseAdmin
      .from('mood_logs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) return undefined;

    return {
      id: updated.id,
      userId: updated.user_id,
      mood: updated.mood,
      moodValue: updated.mood_value,
      createdAt: updated.created_at,
    };
  },
};
