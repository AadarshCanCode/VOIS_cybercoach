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

  async markAssessmentCompleted(userId: string, level: string, email?: string) {
    if (!userId) throw new Error("User ID is required to mark assessment as completed.");

    console.log(`Attempting to mark assessment completed for user ${userId} (${email || 'no email'})`);

    // 1. Precise update by ID
    const { data: dataById, error: errorById } = await supabase
      .from('users')
      .update({
        completed_assessment: true,
        level: level
      })
      .eq('id', userId)
      .select();

    if (errorById) {
      console.warn('Update by ID failed:', errorById.message);
    }

    // 2. Fallback update by email (case-insensitive) if ID failed or found nothing
    if ((!dataById || dataById.length === 0) && email) {
      console.log(`Falling back to email-based update for: ${email}`);
      const { data: dataByEmail, error: errorByEmail } = await supabase
        .from('users')
        .update({
          completed_assessment: true,
          level: level
        })
        .ilike('email', email)
        .select();

      if (errorByEmail) throw new Error(`Failed to save completion status by email: ${errorByEmail.message}`);
      if (!dataByEmail || dataByEmail.length === 0) {
        console.log(`User profile missing for ${email}, creating JIT record...`);
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: email,
            name: email.split('@')[0],
            role: 'student',
            password_hash: 'JIT_ASSESSMENT',
            completed_assessment: true,
            level: level
          })
          .select();

        if (createError) {
          console.error('JIT profile creation failed:', createError.message);
          throw new Error(`Profile not found and auto-creation failed for ${email}. Please ensure you are logged in.`);
        }
        console.log('JIT profile created during assessment submission.');
        return true;
      }
      console.log('Assessment status successfully saved via email fallback.');
      return true;
    }

    if (errorById) throw new Error(`Failed to save completion status: ${errorById.message}`);

    if (!dataById || dataById.length === 0) {
      throw new Error(`Could not find a user profile to update (ID: ${userId}). This might happen if your profile record is missing.`);
    }

    console.log('Assessment status successfully saved via ID.');
    return true;
  }

  async checkAssessmentStatus(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('completed_assessment, level')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }
}

export const assessmentService = new AssessmentService();


