import { supabase } from '@lib/supabase';

export interface AssessmentAttempt {
  id: string;
  user_id: string;
  context: 'initial' | 'in_content' | 'final_exam';
  created_at?: string;
}

export interface AssessmentAnswerInput {
  attempt_id?: string;
  user_id: string;
  question_id: string;
  selected_answer: number;
  confidence_level: number; // 1..5
  is_correct: boolean;
  context?: AssessmentAttempt['context'];
}

class AssessmentService {
  async startAttempt(userId: string, context: AssessmentAttempt['context'] = 'initial') {
    const attemptId = crypto.randomUUID();
    try {
      const { error } = await supabase.from('assessment_responses').insert([{ attempt_id: attemptId, user_id: userId, question_id: 'INIT', selected_answer: 0, confidence_level: 3, is_correct: true, context }]);
      if (error) throw error;
      await supabase.from('assessment_responses').delete().eq('attempt_id', attemptId).eq('question_id', 'INIT');
      return { id: attemptId, user_id: userId, context } as AssessmentAttempt;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn('Assessment attempt bootstrap failed, falling back to client-only attempt:', msg);
      return { id: attemptId, user_id: userId, context } as AssessmentAttempt;
    }
  }

  async submitAnswer(answer: AssessmentAnswerInput) {
    const payload = {
      attempt_id: answer.attempt_id ?? crypto.randomUUID(),
      user_id: answer.user_id,
      question_id: answer.question_id,
      selected_answer: answer.selected_answer,
      confidence_level: answer.confidence_level,
      is_correct: answer.is_correct,
      context: answer.context ?? 'initial'
    };
    const { error } = await supabase.from('assessment_responses').insert([payload]);
    if (error) throw new Error(`Failed to submit answer: ${error.message}`);
    return true;
  }

  async getAttemptResults(attemptId: string) {
    const { data, error } = await supabase
      .from('assessment_responses')
      .select('question_id, is_correct, confidence_level, context')
      .eq('attempt_id', attemptId);
    if (error) throw new Error(`Failed to fetch results: ${error.message}`);
    return data ?? [];
  }
}

export const assessmentService = new AssessmentService();


