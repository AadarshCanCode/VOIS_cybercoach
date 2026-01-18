import { LabCompletion, LabStats } from '../models/labModel.js';

// In-memory storage for demo (in production, use database)
const labCompletions: Map<string, LabCompletion> = new Map();
const LAB_TOTAL = 6;

export function markLabAsCompleted(studentId: string, labId: string): LabCompletion {
  const id = `${studentId}-${labId}`;
  
  // Check if already completed
  if (labCompletions.has(id)) {
    return labCompletions.get(id)!;
  }
  
  const completion: LabCompletion = {
    id,
    studentId,
    labId,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  
  labCompletions.set(id, completion);
  return completion;
}

export function getLabStats(studentId: string): LabStats {
  const completedLabIds = Array.from(labCompletions.values())
    .filter(completion => completion.studentId === studentId)
    .map(completion => completion.labId);
  
  const completedLabs = completedLabIds.length;
  const completionPercentage = (completedLabs / LAB_TOTAL) * 100;
  
  return {
    totalLabs: LAB_TOTAL,
    completedLabs,
    completionPercentage,
    completedLabIds,
  };
}

export function isLabCompleted(studentId: string, labId: string): boolean {
  const id = `${studentId}-${labId}`;
  return labCompletions.has(id);
}
