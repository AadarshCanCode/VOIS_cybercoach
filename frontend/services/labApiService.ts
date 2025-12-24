// Frontend service for lab completion API calls

export interface LabStats {
  totalLabs: number;
  completedLabs: number;
  completionPercentage: number;
  completedLabIds: string[];
}

const getStudentId = () => {
  // In production, get from authenticated user context
  return 'demo-student';
};

export const labApiService = {
  async markLabAsCompleted(labId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/student/labs/${labId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: getStudentId(),
        }),
      });

      if (!response.ok) throw new Error('Failed to mark lab as completed');
      return await response.json();
    } catch (error) {
      console.error('Error marking lab as completed:', error);
      throw error;
    }
  },

  async getLabStats(): Promise<LabStats> {
    try {
      const response = await fetch(
        `/api/student/labs/stats?studentId=${getStudentId()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch lab stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching lab stats:', error);
      throw error;
    }
  },

  async getLabStatus(labId: string): Promise<{ labId: string; completed: boolean }> {
    try {
      const response = await fetch(
        `/api/student/labs/${labId}/status?studentId=${getStudentId()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch lab status');
      return await response.json();
    } catch (error) {
      console.error('Error fetching lab status:', error);
      throw error;
    }
  },
};
