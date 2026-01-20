import { supabase } from '@lib/supabase';

export interface StudentStats {
    coursesCompleted: number;
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
                .from('module_progress')
                .select('*', { count: 'exact', head: true })
                .eq('student_id', userId)
                .eq('completed', true);

            if (coursesError) throw new Error(`Failed to fetch completed courses: ${coursesError.message}`);

            // Get certificates count
            const { count: certificatesEarned, error: certsError } = await supabase
                .from('certificates')
                .select('*', { count: 'exact', head: true })
                .eq('student_id', userId);

            if (certsError && certsError.code !== 'PGRST116') { // Ignore if table doesn't exist yet
                console.warn('Certificates table might not exist or error fetching:', certsError);
            }

            // Try to get study time from user_progress aggregate (sum of time spent)
            const { data: progressData } = await supabase
                .from('module_progress')
                .select('id')
                .eq('student_id', userId);

            // Estimate study time based on completed modules (rough estimate: 1 module = 10 minutes)
            const completedModules = progressData?.length || 0;
            const estimatedMinutes = completedModules * 10;
            const hours = Math.floor(estimatedMinutes / 60);
            const studyTime = hours > 0 ? `${hours} hours` : `${estimatedMinutes} mins`;

            return {
                coursesCompleted: coursesCompleted || 0,
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
                .from('module_progress')
                .select(`
          id,
          completed_at,
          completed,
          module:modules(title)
        `)
                .eq('student_id', userId)
                .order('completed_at', { ascending: false })
                .limit(5);

            if (progressError) throw new Error(`Failed to fetch recent activity: ${progressError.message}`);

            // Transform to RecentActivity format
            // This is a simplified version. In a real app, you might union multiple tables (logs, certs, etc.)
            const activities: RecentActivity[] = progressData.map((item: any) => ({
                id: item.id,
                action: item.completed ? `Completed ${item.module?.title}` : `Started ${item.module?.title}`,
                created_at: item.completed_at || new Date().toISOString(),
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
                    const response = await fetch(`http://localhost:4000/api/vu/student/${vuEmail}`);
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
                .from('module_progress')
                .select(`
                    completed_at,
                    module_id
                `)
                .eq('student_id', userId)
                .eq('completed', false)
                .order('completed_at', { ascending: false })
                .limit(1)
                .maybeSingle() as any;

            if (progressError) {
                if (progressError.code === 'PGRST116') return null; // No active operation found
                // Don't throw here if we want to degrade gracefully, or if VU might be primary
                console.warn(`Failed to fetch active operation from Supabase: ${progressError.message}`);
                return null;
            }

            if (!progressData || !progressData.course) return null;

            return {
                courseId: '',
                title: 'Continuing Session',
                description: 'Pick up where you left off',
                currentModule: 'In Progress',
                progress: 0,
                lastAccessed: progressData?.completed_at || new Date().toISOString()
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

    async getCertificates(userId: string): Promise<any[]> {
        try {
            const { data, error } = await supabase
                .from('certificates')
                .select('*')
                .eq('student_id', userId)
                .order('issued_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Get certificates error:', error);
            return [];
        }
    }
}

export const studentService = new StudentService();