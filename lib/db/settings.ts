import { supabaseAdmin } from '../supabase';
import type { AssessmentConfig } from '../types';
import { toSettings } from './mappers';

export const settingsRepo = {
  async getConfig(): Promise<AssessmentConfig> {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('id, display_count, selection_mode, manual_question_ids, randomize_order')
      .eq('id', 'assessment_config')
      .single();

    if (error || !data) {
      return {
        id: 'assessment_config',
        displayCount: 10,
        selectionMode: 'random',
        manualQuestionIds: [],
        randomizeOrder: true,
      };
    }

    return toSettings(data);
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
