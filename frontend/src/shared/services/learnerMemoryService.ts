import { supabase } from '@lib/supabase';

export interface MemoryFact {
  kind: 'strength' | 'gap' | 'preference' | 'note';
  topic?: string;
  text: string;
}

class LearnerMemoryService {
  private table = 'notes'; // reuse notes table for demo memory storage

  async upsertFacts(userId: string, facts: MemoryFact[]) {
    const rows = facts.map(f => ({ admin_id: userId, content: `[${f.kind}] ${f.topic ? f.topic + ': ' : ''}${f.text}` }));
    const { error } = await supabase.from(this.table).insert(rows);
    if (error) {
      console.warn('Memory store failed (falling back, non-fatal):', error);
      return false;
    }
    return true;
  }

  async getContext(userId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('content, created_at')
        .eq('admin_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) {
        console.warn('Memory load failed (using empty context):', error);
        return '';
      }
  return (data || []).map((d: { content?: string }) => d.content || '').join('\n');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn('Memory load exception (using empty context):', msg);
      return '';
    }
  }
}

export const learnerMemoryService = new LearnerMemoryService();


