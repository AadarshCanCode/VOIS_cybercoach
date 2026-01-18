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

export interface ActiveOperation {
    courseId: string;
    title: string;
    description: string;
    currentModule: string;
    progress: number;
    lastAccessed: string;
}

export interface CourseProgress {
    courseId: string;
    title: string;
    progress: number;
    completed: boolean;
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

    async getActiveOperation(userId: string): Promise<ActiveOperation | null> {
        try {
            // Check for VU Student (MongoDB)
            const vuEmail = typeof localStorage !== 'undefined' ? localStorage.getItem('vu_student_email') : null;
            if (vuEmail) {
                try {
                    const apiBase = import.meta.env.VITE_API_URL || '';
                    const response = await fetch(`${apiBase}/api/vu/student/${vuEmail}`);
                    if (response.ok) {
                        const student = await response.json();
                        if (student && student.progress && student.progress.length > 0) {
                            // Find most recent activity
                            const sortedProgress = student.progress.sort((a: any, b: any) =>
                                new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
                            );

                            const latest = sortedProgress[0];

                            // Hardcoded details for the single VU course for now to avoid circular dependency or complex imports
                            let courseTitle = 'Unknown Course';
                            let totalModules = 1;
                            let moduleTitle = 'Unknown Module';
                            let courseDesc = 'Continuing Education';

                            if (latest.course_id === 'vu-web-security') {
                                courseTitle = 'Web Application Security';
                                courseDesc = 'Learn to identify and exploit vulnerabilities in web applications.';
                                totalModules = 11;
                                moduleTitle = `Module ${latest.module_id.replace('vu-mod-', '')}`;
                            }

                            // Calculate progress for this course
                            const courseProgressItems = student.progress.filter((p: any) => p.course_id === latest.course_id && p.completed);
                            const percent = Math.round((courseProgressItems.length / totalModules) * 100);

                            return {
                                courseId: latest.course_id,
                                title: courseTitle,
                                description: courseDesc,
                                currentModule: moduleTitle,
                                progress: percent,
                                lastAccessed: latest.completed_at
                            };
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch VU active operation:', err);
                }
            }

            // Get the most recently accessed uncompleted course
            const { data: progressData, error: progressError } = await supabase
                .from('user_progress')
                .select(`
                    updated_at,
                    course_id,
                    module_id
                `)
                .eq('user_id', userId)
                .eq('completed', false)
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle() as any;

            if (progressError) {
                if (progressError.code === 'PGRST116') return null; // No active operation found
                // Don't throw here if we want to degrade gracefully, or if VU might be primary
                console.warn(`Failed to fetch active operation from Supabase: ${progressError.message}`);
                return null;
            }

            if (!progressData || !progressData.course) return null;

            // Get progress for this course
            const { data: completionData, error: completionError } = await supabase
                .rpc('get_module_completion', {
                    course_id: (progressData.course as any).id,
                    user_id: userId
                });

            if (completionError) {
                console.warn('Failed to fetch completion stats, defaulting to 0:', completionError);
            }

            const progress = completionData && completionData.length > 0 ? completionData[0].progress : 0;

            return {
                courseId: progressData.course_id || '',
                title: 'Continuing Session',
                description: 'Pick up where you left off',
                currentModule: 'In Progress',
                progress: progress || 0,
                lastAccessed: progressData.updated_at
            };
        } catch (error) {
            console.error('Get active operation error:', error);
            return null;
        }
    }

    async getAllCoursesProgress(userId: string): Promise<CourseProgress[]> {
        try {
            // 1. Get all courses
            const { data: courses, error: coursesError } = await supabase
                .from('courses')
                .select('id, title');

            if (coursesError) throw new Error(`Failed to fetch courses: ${coursesError.message}`);
            if (!courses) return [];

            // 2. Calculate progress for each course
            const progressPromises = courses.map(async (course) => {
                const { data: completionData } = await supabase
                    .rpc('get_module_completion', {
                        course_id: course.id,
                        user_id: userId
                    });

                const progress = completionData && completionData.length > 0 ? completionData[0].progress : 0;

                return {
                    courseId: course.id,
                    title: course.title,
                    progress: progress || 0,
                    completed: progress >= 100
                };
            });

            return await Promise.all(progressPromises);
        } catch (error) {
            console.error('Get all courses progress error:', error);
            return [];
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