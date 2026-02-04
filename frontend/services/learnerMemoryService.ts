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
  async getKnowledgeGraph(userId: string) {
    try {
      // 1. Fetch all notes tagged as [knowledge_graph]
      const { data, error } = await supabase
        .from(this.table)
        .select('content, created_at')
        .eq('admin_id', userId)
        .ilike('content', '[knowledge_graph]%')
        .order('created_at', { ascending: true }); // Oldest first to replay history if needed, but we just need latest state usually

      if (error) throw error;

      // 2. Aggregate scores (Concept: Event Sourcing - play forward updates)
      const graph: Record<string, { confidence: number; last_updated: string }> = {};

      data?.forEach((row: { content: string; created_at: string }) => {
        try {
          // Content format: "[knowledge_graph] <JSON>"
          const jsonStr = row.content.replace('[knowledge_graph] ', '');
          const update = JSON.parse(jsonStr);

          // update: { topic: string, delta?: number, absolute?: number }
          if (update.topic) {
            if (!graph[update.topic]) {
              graph[update.topic] = { confidence: 50, last_updated: row.created_at }; // Start at 50% neutral
            }

            if (update.absolute !== undefined) {
              graph[update.topic].confidence = update.absolute;
            } else if (update.delta !== undefined) {
              graph[update.topic].confidence = Math.min(100, Math.max(0, graph[update.topic].confidence + update.delta));
            }
            graph[update.topic].last_updated = row.created_at;
          }
        } catch (e) {
          // Ignore malformed rows
        }
      });

      return graph;
    } catch (error) {
      console.warn('Failed to fetch knowledge graph:', error);
      return {};
    }
  }

  async updateConfidence(userId: string, topic: string, delta: number) {
    // We store the *delta* as a new event. 
    // This allows us to reconstruct the score and keeps a history of progress.
    const payload = JSON.stringify({ topic, delta });
    const content = `[knowledge_graph] ${payload}`;

    const { error } = await supabase
      .from(this.table)
      .insert([{ admin_id: userId, content }]); // Intentionally appending new row

    if (error) {
      console.error('Failed to update confidence:', error);
      return false;
    }
    return true;
  }
}

export const learnerMemoryService = new LearnerMemoryService();


