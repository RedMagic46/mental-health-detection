import { supabaseAdmin } from '../supabase';
import type { Consultation } from '../types';
import { toConsultation } from './mappers';

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
        assigned_consultant_id: data.assignedConsultantId || null,
        internal_notes: data.internalNotes || null,
      })
      .select('id, user_id, name, email, message, status, created_at, assigned_consultant_id, internal_notes')
      .single();

    if (error) {
      throw new Error(`Failed to create consultation: ${error.message}`);
    }

    return toConsultation(newConsultation);
  },

  async findAll(): Promise<Consultation[]> {
    const { data, error } = await supabaseAdmin
      .from('consultations')
      .select('id, user_id, name, email, message, status, created_at, assigned_consultant_id, internal_notes')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(toConsultation);
  },

  async findById(id: string): Promise<Consultation | undefined> {
    const { data, error } = await supabaseAdmin
      .from('consultations')
      .select('id, user_id, name, email, message, status, created_at, assigned_consultant_id, internal_notes')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return toConsultation(data);
  },

  async updateStatus(id: string, status: Consultation['status']): Promise<Consultation | undefined> {
    const { data, error } = await supabaseAdmin
      .from('consultations')
      .update({ status })
      .eq('id', id)
      .select('id, user_id, name, email, message, status, created_at, assigned_consultant_id, internal_notes')
      .single();

    if (error || !data) return undefined;
    return toConsultation(data);
  },

  async findByUserId(userId: string): Promise<Consultation[]> {
    const { data, error } = await supabaseAdmin
      .from('consultations')
      .select('id, user_id, name, email, message, status, created_at, assigned_consultant_id, internal_notes')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(toConsultation);
  },

  async update(
    id: string,
    updates: Partial<Pick<Consultation, 'status' | 'assignedConsultantId' | 'internalNotes'>>
  ): Promise<Consultation | undefined> {
    const updateData: any = {};
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.assignedConsultantId !== undefined) updateData.assigned_consultant_id = updates.assignedConsultantId;
    if (updates.internalNotes !== undefined) updateData.internal_notes = updates.internalNotes;

    const { data, error } = await supabaseAdmin
      .from('consultations')
      .update(updateData)
      .eq('id', id)
      .select('id, user_id, name, email, message, status, created_at, assigned_consultant_id, internal_notes')
      .single();

    if (error || !data) return undefined;
    return toConsultation(data);
  },

  async findByAssignedConsultant(consultantId: string): Promise<Consultation[]> {
    const { data, error } = await supabaseAdmin
      .from('consultations')
      .select('id, user_id, name, email, message, status, created_at, assigned_consultant_id, internal_notes')
      .eq('assigned_consultant_id', consultantId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(toConsultation);
  },

  async hasAssignment(consultantId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('consultations')
      .select('id')
      .eq('assigned_consultant_id', consultantId)
      .eq('user_id', userId)
      .limit(1);

    if (error || !data || data.length === 0) return false;
    return true;
  },

  async count(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('consultations')
      .select('id', { count: 'exact', head: true });
    
    if (error) return 0;
    return count || 0;
  },

  async countByStatus(status: Consultation['status']): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('consultations')
      .select('id', { count: 'exact', head: true })
      .eq('status', status);
    
    if (error) return 0;
    return count || 0;
  },
};
