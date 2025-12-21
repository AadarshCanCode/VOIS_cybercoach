import { supabase } from '@lib/supabase';
import type { AnalysisSummary } from './ragService';

class LearningPathService {
  async allocateInitialPath(userId: string, courseId: string, analysis: AnalysisSummary) {
    const gapTopics = new Set(analysis.gaps.map(g => g.topic));
    const { data: modules, error } = await supabase
      .from('course_modules')
      .select('id, title, module_order')
      .eq('course_id', courseId)
      .order('module_order', { ascending: true });
    if (error) throw new Error(`Failed to fetch modules: ${error.message}`);

    const prioritized = (modules || []).map(m => ({ ...m, priority: gapTopics.size ? (gapTopics.has((m.title.split(' ')[0] || 'general').toLowerCase()) ? 0 : 1) : 1 }))
      .sort((a, b) => a.priority - b.priority || a.module_order - b.module_order);

    const upserts = prioritized.map(m => ({ user_id: userId, course_id: courseId, module_id: m.id, completed: false, quiz_score: 0, topic: (m.title.split(' ')[0] || 'general').toLowerCase(), source: 'adaptive' }));
    if (upserts.length) {
      const { error: upsertError } = await supabase.from('user_progress').upsert(upserts);
      if (upsertError) throw new Error(`Failed to allocate path: ${upsertError.message}`);
    }
    return upserts.map(u => u.module_id);
  }

  async rebalance(userId: string, courseId: string) {
    // Simple placeholder: ensure at least next 2 modules are present
    const { data, error } = await supabase
      .from('user_progress')
      .select('module_id, completed')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .order('updated_at', { ascending: false });
    if (error) throw new Error(`Failed to read progress: ${error.message}`);
    return data ?? [];
  }
}

export const learningPathService = new LearningPathService();


