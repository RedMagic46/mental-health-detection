import { supabaseAdmin } from '../supabase';
import type { ChatMessage } from '../types';
import { toChatMessage } from './mappers';

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
      .select('id, consultation_id, sender_id, sender_role, message, created_at')
      .single();

    if (error) {
      throw new Error(`Failed to create chat message: ${error.message}`);
    }

    return toChatMessage(newMsg);
  },

  async findByConsultationId(consultationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .select('id, consultation_id, sender_id, sender_role, message, created_at')
      .eq('consultation_id', consultationId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data.map(toChatMessage);
  },
};
