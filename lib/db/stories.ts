import { supabaseAdmin } from '../supabase';
import type { SuccessStory } from '../types';
import { toSuccessStory } from './mappers';

export const successStoryRepo = {
  async findAll(): Promise<SuccessStory[]> {
    const { data, error } = await supabaseAdmin
      .from('success_stories')
      .select('id, title, content, author_name, author_role, rating, created_at')
      .order('created_at', { ascending: true });

    if (error || !data) {
      return [
        {
          id: 1,
          title: 'Sangat Membantu',
          content: 'Mental Health Screening yang disediakan MindCare sangat membantu saya menyadari kondisi emosional saya akhir-akhir ini.',
          authorName: 'Amalia',
          authorRole: 'Pengguna',
          rating: 5,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Konseling Tepat Sasaran',
          content: 'Sistem matching-nya luar biasa. Saya mendapatkan psikolog yang benar-benar mengerti permasalahan yang saya hadapi.',
          authorName: 'Ivan S.',
          authorRole: 'Pengguna Konseling',
          rating: 5,
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          title: 'Nyaman Berbagi',
          content: 'Fitur anonymous chat membuat saya tidak ragu untuk menceritakan hal-hal yang membebani pikiran saya selama ini.',
          authorName: 'Rafles R.',
          authorRole: 'Pengguna Forum',
          rating: 4,
          createdAt: new Date().toISOString(),
        },
      ];
    }

    return data.map(toSuccessStory);
  },

  async create(data: Omit<SuccessStory, 'id' | 'createdAt'>): Promise<SuccessStory> {
    const { data: inserted, error } = await supabaseAdmin
      .from('success_stories')
      .insert({
        title: data.title,
        content: data.content,
        author_name: data.authorName,
        author_role: data.authorRole,
        rating: data.rating,
      })
      .select('id, title, content, author_name, author_role, rating, created_at')
      .single();

    if (error) {
      throw new Error(`Failed to create success story: ${error.message}`);
    }

    return toSuccessStory(inserted);
  },

  async update(id: number, data: Partial<Omit<SuccessStory, 'id' | 'createdAt'>>): Promise<SuccessStory | undefined> {
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.content) updateData.content = data.content;
    if (data.authorName) updateData.author_name = data.authorName;
    if (data.authorRole) updateData.author_role = data.authorRole;
    if (data.rating !== undefined) updateData.rating = data.rating;

    const { data: updated, error } = await supabaseAdmin
      .from('success_stories')
      .update(updateData)
      .eq('id', id)
      .select('id, title, content, author_name, author_role, rating, created_at')
      .single();

    if (error || !updated) return undefined;
    return toSuccessStory(updated);
  },

  async delete(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('success_stories')
      .delete()
      .eq('id', id);
    return !error;
  },
};
