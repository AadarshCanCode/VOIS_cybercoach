// Frontend service for lab completion API calls
import { supabase } from '@lib/supabase';

export interface LabStats {
  totalLabs: number;
  completedLabs: number;
  completionPercentage: number;
  completedLabIds: string[];
}

const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return headers;
};

export const labApiService = {
  async markLabAsCompleted(labId: string): Promise<{ success: boolean; message: string }> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/student/labs/${labId}/complete`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to mark lab as completed');
      }
      return await response.json();
    } catch (error) {
      console.error('Error marking lab as completed:', error);
      throw error;
    }
  },

  async getLabStats(): Promise<LabStats> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/student/labs/stats`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        // If auth fails, return empty stats instead of throwing
        if (response.status === 401 || response.status === 403) {
          console.warn('Unauthorized: Returning empty lab stats');
          return {
            totalLabs: 6,
            completedLabs: 0,
            completionPercentage: 0,
            completedLabIds: [],
          };
        }
        throw new Error('Failed to fetch lab stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching lab stats:', error);
      // Return empty stats on error so labs still display
      return {
        totalLabs: 6,
        completedLabs: 0,
        completionPercentage: 0,
        completedLabIds: [],
      };
    }
  },

  async getLabStatus(labId: string): Promise<{ labId: string; completed: boolean }> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/student/labs/${labId}/status`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return { labId, completed: false };
        }
        throw new Error('Failed to fetch lab status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching lab status:', error);
      return { labId, completed: false };
    }
  },
};
