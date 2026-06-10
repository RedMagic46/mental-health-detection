import { supabaseAdmin } from '../supabase';

export const passwordResetRepo = {
  async create(email: string, otp: string, expiresAt: Date) {
    await this.deleteByEmail(email);

    const { data, error } = await supabaseAdmin
      .from('password_resets')
      .insert({
        email,
        otp,
        expires_at: expiresAt.toISOString(),
      })
      .select('id, email, otp, expires_at, created_at')
      .single();

    if (error) {
      throw new Error(`Failed to create password reset: ${error.message}`);
    }
    return data;
  },

  async findValidOTP(email: string, otp: string) {
    const { data, error } = await supabaseAdmin
      .from('password_resets')
      .select('id, email, otp, expires_at, created_at')
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
