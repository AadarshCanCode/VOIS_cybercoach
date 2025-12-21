import { supabase } from '@lib/supabase';

export interface StudentStats {
    coursesCompleted: number;
    assessmentScore: number | null;
    certificatesEarned: number;
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

            // Get assessment score (assuming stored in users table or a separate assessments table)
            // For now, checking users table based on previous code context
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('assessment_score, study_time_minutes')
                .eq('id', userId)
                .single();

            if (userError) throw new Error(`Failed to fetch user data: ${userError.message}`);

            // Get certificates count
            const { count: certificatesEarned, error: certsError } = await supabase
                .from('certificates')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (certsError && certsError.code !== 'PGRST116') { // Ignore if table doesn't exist yet, handle gracefully
                console.warn('Certificates table might not exist or error fetching:', certsError);
            }

            // Format study time
            const minutes = userData?.study_time_minutes || 0;
            const hours = Math.floor(minutes / 60);
            const studyTime = `${hours} hours`;

            return {
                coursesCompleted: coursesCompleted || 0,
                assessmentScore: userData?.assessment_score || null,
                certificatesEarned: certificatesEarned || 0,
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
