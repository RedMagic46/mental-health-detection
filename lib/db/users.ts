import { supabaseAdmin } from '../supabase';
import type { User } from '../types';
import { toUser } from './mappers';

let hasLastActiveAt: boolean | null = null;

async function getSelectFields(): Promise<string> {
  if (hasLastActiveAt === null) {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .select('last_active_at')
        .limit(1);
      hasLastActiveAt = !error || !error.message.includes('last_active_at');
    } catch {
      hasLastActiveAt = false;
    }
  }
  return hasLastActiveAt
    ? 'id, name, email, password_hash, role, created_at, last_active_at'
    : 'id, name, email, password_hash, role, created_at';
}

export const userRepo = {
  async findByEmail(email: string): Promise<User | undefined> {
    const fields = await getSelectFields();
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(fields)
      .eq('email', email)
      .single();

    if (error || !data) return undefined;
    return toUser(data);
  },

  async findById(id: string): Promise<User | undefined> {
    const fields = await getSelectFields();
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(fields)
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return toUser(data);
  },

  async create(data: Omit<User, 'id' | 'createdAt' | 'lastActiveAt'>): Promise<User> {
    const fields = await getSelectFields();
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        name: data.name,
        email: data.email,
        password_hash: data.passwordHash,
        role: data.role,
      })
      .select(fields)
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return toUser(newUser);
  },

  async count(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true });
    
    if (error) return 0;
    return count || 0;
  },

  async update(id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'lastActiveAt'>>): Promise<User | undefined> {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (data.passwordHash) updateData.password_hash = data.passwordHash;

    const fields = await getSelectFields();
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select(fields)
      .single();

    if (error || !updatedUser) return undefined;
    return toUser(updatedUser);
  },

  async findAll(): Promise<User[]> {
    const fields = await getSelectFields();
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(fields)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(toUser);
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    return !error;
  },

  async findConsultants(): Promise<User[]> {
    const fields = await getSelectFields();
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(fields)
      .eq('role', 'consultant')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(toUser);
  },
};
