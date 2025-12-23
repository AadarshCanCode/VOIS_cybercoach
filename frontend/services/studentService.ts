import { supabase } from '@lib/supabase';

export interface StudentStats {
    coursesCompleted: number;
    assessmentScore: number | null;
    certificatesEarned: number;
    liveLabsCompleted: number;
    studyTime: string; // This might need to be calculated or stored
}

export interface RecentActivity {
    id: string;
    action: string;
    created_at: string;
    type: 'completion' | 'start' | 'achievement' | 'certificate';
}

class StudentService {
    async getDashboardStats(userId: string): Promise<StudentStats> {
        try {
            // Get completed courses count
            const { count: coursesCompleted, error: coursesError } = await supabase
                .from('user_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('completed', true);

            if (coursesError) throw new Error(`Failed to fetch completed courses: ${coursesError.message}`);

            // Get certificates count
            const { count: certificatesEarned, error: certsError } = await supabase
                .from('certificates')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (certsError && certsError.code !== 'PGRST116') { // Ignore if table doesn't exist yet
                console.warn('Certificates table might not exist or error fetching:', certsError);
            }

            // Try to get study time from user_progress aggregate (sum of time spent)
            const { data: progressData } = await supabase
                .from('user_progress')
                .select('progress')
                .eq('user_id', userId);

            // Estimate study time based on progress (rough estimate: 1 progress point = 1 minute)
            const totalProgress = progressData?.reduce((sum, p) => sum + (p.progress || 0), 0) || 0;
            const estimatedMinutes = totalProgress * 2; // 2 minutes per progress point
            const hours = Math.floor(estimatedMinutes / 60);
            const studyTime = hours > 0 ? `${hours} hours` : `${estimatedMinutes} mins`;

            return {
                coursesCompleted: coursesCompleted || 0,
                assessmentScore: null, // Assessment scores tracked separately in assessment results
                certificatesEarned: certificatesEarned || 0,
                liveLabsCompleted: 0, // Placeholder for now, or fetch from a future labs table
                studyTime
            };
        } catch (error) {
            console.error('Get student dashboard stats error:', error);
            throw error;
        }
    }

    async getRecentActivity(userId: string): Promise<RecentActivity[]> {
        try {
            // Fetch recent progress updates
            const { data: progressData, error: progressError } = await supabase
                .from('user_progress')
                .select(`
          id,
          updated_at,
          completed,
          course:courses(title)
        `)
                .eq('user_id', userId)
                .order('updated_at', { ascending: false })
                .limit(5);

            if (progressError) throw new Error(`Failed to fetch recent activity: ${progressError.message}`);

            // Transform to RecentActivity format
            // This is a simplified version. In a real app, you might union multiple tables (logs, certs, etc.)
            const activities: RecentActivity[] = progressData.map((item: any) => ({
                id: item.id,
                action: item.completed ? `Completed ${item.course?.title}` : `Started ${item.course?.title}`,
                created_at: item.updated_at,
                type: item.completed ? 'completion' : 'start'
            }));

            return activities;
        } catch (error) {
            console.error('Get recent activity error:', error);
            return []; // Return empty array on error to prevent crash
        }
    }

    // Personal Notes Methods
    async getPersonalNotes(userId: string): Promise<any[]> {
        try {
            const { data, error } = await supabase
                .from('student_notes')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Get personal notes error:', error);
            throw error;
        }
    }

    async addPersonalNote(note: { user_id: string; title: string; type: 'link' | 'pdf'; content_url: string }): Promise<any> {
        try {
            const { data, error } = await supabase
                .from('student_notes')
                .insert([note])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Add personal note error:', error);
            throw error;
        }
    }

    async deletePersonalNote(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('student_notes')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Delete personal note error:', error);
            throw error;
        }
    }

    async uploadPersonalFile(file: File): Promise<string> {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('student_uploads')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('student_uploads')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Upload personal file error:', error);
            throw error;
        }
    }
}

export const studentService = new StudentService();