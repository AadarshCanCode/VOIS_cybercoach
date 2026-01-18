import { LabCompletion, LabStats } from '../models/labModel.js';
import { supabase } from '../../lib/supabase.js';

const LAB_TOTAL = 17;

export async function markLabAsCompleted(studentId: string, labId: string): Promise<LabCompletion> {
  const { data, error } = await supabase
    .from('lab_completions')
    .upsert(
      {
        user_id: studentId,
        lab_id: labId,
        completed: true,
        completed_at: new Date().toISOString()
      },
      { onConflict: 'user_id,lab_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error marking lab as completed:', error);
    throw error;
  }

  return {
    id: data.id,
    studentId: data.user_id,
    labId: data.lab_id,
    completedAt: data.completed_at,
    createdAt: data.created_at,
  };
}

export async function getLabStats(studentId: string): Promise<LabStats> {
  const { data, error } = await supabase
    .from('lab_completions')
    .select('lab_id')
    .eq('user_id', studentId);

  if (error) {
    console.error('Error fetching lab stats:', error);
    throw error;
  }

  const completedLabIds = data ? data.map(row => row.lab_id) : [];
  const completedLabs = completedLabIds.length;
  const completionPercentage = (completedLabs / LAB_TOTAL) * 100;

  return {
    totalLabs: LAB_TOTAL,
    completedLabs,
    completionPercentage,
    completedLabIds,
  };
}

export async function isLabCompleted(studentId: string, labId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('lab_completions')
    .select('id')
    .eq('user_id', studentId)
    .eq('lab_id', labId)
    .maybeSingle();

  if (error) {
    console.error('Error checking lab completion:', error);
    return false;
  }

  return !!data;
}
