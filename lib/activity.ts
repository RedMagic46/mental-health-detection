import { supabaseAdmin } from './supabase';

let activityChecked = false;
let canRecordActivity = true;

export function recordUserActivity(userId: string): void {
  if (activityChecked && !canRecordActivity) return;

  const now = new Date().toISOString();
  supabaseAdmin
    .from('users')
    .update({ last_active_at: now })
    .eq('id', userId)
    .then(({ error }) => {
      activityChecked = true;
      if (error) {
        if (error.message.includes('last_active_at')) {
          canRecordActivity = false;
        } else {
          console.error('[ACTIVITY] Error updating activity in db:', error.message);
        }
      } else {
        canRecordActivity = true;
      }
    });
}
