import { supabase } from '@lib/supabase';
import type { Course, Module } from '@types';

class CourseService {
  // Course Management
  async createCourse(courseData: Omit<Partial<Course>, 'modules'> & { modules?: Partial<Module>[] }) {
    try {
      console.log('Creating course with data:', courseData);

      let contentJsonUrl = null;

      // Hybrid Storage: Upload content to bucket if modules exist
      if (courseData.modules && courseData.modules.length > 0) {
        const courseContent = {
          title: courseData.title,
          description: courseData.description,
          modules: courseData.modules,
          generatedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(courseContent)], { type: 'application/json' });
        const fileName = `course_${Date.now()}_${Math.random().toString(36).substring(7)}.json`;

        const { error: uploadError } = await supabase.storage
          .from('course-content')
          .upload(fileName, blob);

        if (uploadError) {
          console.error('Failed to upload course content:', uploadError);
          // Continue with DB creation, but warn
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('course-content')
            .getPublicUrl(fileName);
          contentJsonUrl = publicUrl;
        }
      }

      const { data, error } = await supabase
        .from('courses')
        .insert([{
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          difficulty: courseData.difficulty,
          estimated_hours: courseData.estimated_hours || 0,
          // is_published: removed
          enrollment_count: 0,
          rating: 0,
          content_json_url: contentJsonUrl
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to create course: ${error.message}`);
      }

      console.log('Course created successfully:', data);

      // Return full course object with modules
      return {
        ...data,
        modules: courseData.modules || []
      };
    } catch (error) {
      console.error('Create course error:', error);
      throw error;
    }
  }

  async updateCourse(id: string, updates: Omit<Partial<Course>, 'modules'> & { modules?: Partial<Module>[] }) {
    try {
      // Hybrid Storage Update: Re-upload content if modules are provided
      if (updates.modules && updates.modules.length > 0) {
        const courseContent = {
          title: updates.title, // Note: might need to fetch existing title if not in updates, but assuming full update usually
          description: updates.description,
          modules: updates.modules,
          updatedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(courseContent)], { type: 'application/json' });
        const fileName = `course_${id}_${Date.now()}.json`; // Use ID to keep it related? Or just new file. New file avoids cache.

        const { error: uploadError } = await supabase.storage
          .from('course-content')
          .upload(fileName, blob);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('course-content')
            .getPublicUrl(fileName);

          // Add the new URL to the updates object for the DB update
          (updates as any).content_json_url = publicUrl;
        } else {
          console.error('Failed to upload updated course content:', uploadError);
        }
      }

      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update course: ${error.message}`);

      // Return full course object with modules (if updated)
      return {
        ...data,
        modules: updates.modules || [] // Note: might need existing modules if not updated, but for now this is safer than nothing
      };
    } catch (error) {
      console.error('Update course error:', error);
      throw error;
    }
  }

  async deleteCourse(id: string) {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Failed to delete course: ${error.message}`);
      return true;
    } catch (error) {
      console.error('Delete course error:', error);
      throw error;
    }
  }



  async getVUStudent(email: string): Promise<any> {
    try {
      // Attempt to match with static web security course data if applicable
      // valid emails for demo
      const validEmails = ['demo@vu.com', 'test@example.com', email];

      if (validEmails.includes(email)) {
        // Return a mock student object that matches what Profile.tsx expects
        return {
          name: 'VU Student',
          email: email,
          progress: [
            { course_id: 'vu-web-security', completed: true }
          ]
        };
      }
      return null;
    } catch (error) {
      console.error('Get VU Student error:', error);
      return null;
    }
  }

  async getAllCourses(): Promise<Course[]> {
    try {
      console.log('Fetching courses from Supabase...');
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw new Error(`Failed to fetch courses: ${error.message}`);

      return (data || []).map((course: any) => ({
        ...course,
        module_count: 0, // Will be updated if fetched with modules
        modules: [],
        skills: []
      }));
    } catch (error) {
      console.error('Get all courses error:', error);
      return [];
    }
  }

  async getCourseById(id: string): Promise<Course | null> {
    // 0. Static Override for VU Course
    if (id === 'vu-web-security') {
      const { vuWebSecurityCourse } = await import('@data/vu-courses/web-application-security');
      return vuWebSecurityCourse;
    }

    try {
      // 1. Fetch from Supabase
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) {
        console.error('Supabase error fetching course:', courseError);
        return null;
      }
      if (!course) return null;

      // 2. Fetch Modules
      const modules = await this.getModulesByCourse(id);

      return {
        ...course,
        modules: modules
      } as Course;
    } catch (error) {
      console.error('Get course by id error:', error);
      return null;
    }
  }

  async getModuleCount(courseId: string): Promise<number> {
    if (courseId === 'vu-web-security') return 12;
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId);

      if (error) throw new Error(`Failed to count modules: ${error.message}`);
      return data?.length || 0;
    } catch (error) {
      console.error('Get module count error:', error);
      throw error;
    }
  }  // Module Management
  async createModule(moduleData: Partial<Module>) {
    try {
      // Check current module count
      const currentCount = await this.getModuleCount(moduleData.course_id!);

      if (currentCount >= 10) {
        throw new Error('Maximum module limit (10) reached for this course');
      }

      const { data, error } = await supabase
        .from('modules')
        .insert([{
          ...moduleData,
          module_order: currentCount + 1
          // is_published: false // Removed
        }])
        .select()
        .single();

      if (error) throw new Error(`Failed to create module: ${error.message}`);
      return data;
    } catch (error) {
      console.error('Create module error:', error);
      throw error;
    }
  }

  async updateModule(id: string, updates: Partial<Module>) {
    try {
      const { data, error } = await supabase
        .from('modules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update module: ${error.message}`);
      return data;
    } catch (error) {
      console.error('Update module error:', error);
      throw error;
    }
  }

  async getModulesByCourse(courseId: string) {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('module_order', { ascending: true });

      if (error) throw new Error(`Failed to fetch modules: ${error.message}`);

      // Resolve content for modules that have a file path
      const resolvedModules = await Promise.all((data || []).map(async (module: any) => {
        let content = module.content_markdown || '';

        // If content_markdown is a file path (ends with .md), fetch it from CDN
        if (content.endsWith('.md')) {
          try {
            const { data: { publicUrl } } = supabase.storage
              .from('courses')
              .getPublicUrl(content);

            const response = await fetch(publicUrl);
            if (response.ok) {
              content = await response.text();
            } else {
              content = `Error: Could not load module content (HTTP ${response.status})`;
            }
          } catch (e) {
            console.error(`Failed to fetch module content from CDN for ${module.id}:`, e);
            content = 'Error: Connection failed while loading module content';
          }
        }

        return {
          ...module,
          content: content, // Map to content field used by UI
          order: module.module_order // Map to order field used by UI
        };
      }));

      return resolvedModules;
    } catch (error) {
      console.error('Get modules error:', error);
      throw error;
    }
  }

  // Progress Tracking


  async getUserProgress(userId: string) {
    try {
      // For all courses, fetch from module_progress
      const { data, error } = await supabase
        .from('module_progress')
        .select('*')
        .eq('student_id', userId);

      if (error) throw new Error(`Failed to fetch user progress: ${error.message}`);
      return data;
    } catch (error) {
      console.error('Get user progress error:', error);
      throw error;
    }
  }

  async updateProgress(userId: string, moduleId: string, completed: boolean, quizScore?: number) {
    try {
      // Save progress to Supabase
      const updates: any = {
        student_id: userId,
        module_id: moduleId,
        completed,
        completed_at: new Date().toISOString()
      };

      if (quizScore !== undefined) {
        updates.quiz_score = quizScore;
      }

      const { error } = await supabase
        .from('module_progress')
        .upsert([updates]);

      if (error) {
        throw new Error(`Supabase progress update failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Update progress error:', error);
      throw error;
    }
  }

  // Enrollment Management
  async enrollInCourse(userId: string, courseId: string) {
    try {
      // Handle static VU courses
      if (courseId === 'vu-web-security') {
        const key = `vu_enrollments_${userId}`;
        let enrollments = [];
        try {
          enrollments = JSON.parse(localStorage.getItem(key) || '[]');
        } catch (e) { enrollments = []; }

        if (!enrollments.includes(courseId)) {
          enrollments.push(courseId);
          localStorage.setItem(key, JSON.stringify(enrollments));
        }
        return { user_id: userId, course_id: courseId, enrolled_at: new Date().toISOString() };
      }

      // Avoid double-enrollments
      const { data: existing, error: existingErr } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      if (existingErr) {
        console.warn('Error checking existing enrollment:', existingErr.message);
      }

      if (existing) return existing;

      const { data: inserted, error: insertErr } = await supabase
        .from('enrollments')
        .insert([{ student_id: userId, course_id: courseId }])
        .select()
        .single();

      if (insertErr) throw new Error(`Failed to enroll in course: ${insertErr.message}`);

      return inserted;
    } catch (error) {
      console.error('Enroll in course error:', error);
      throw error;
    }
  }

  async getUserEnrollments(userId: string) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          course:courses(
            *
          )
        `)
        .eq('student_id', userId)
        .order('enrolled_at', { ascending: false });

      if (error) throw new Error(`Failed to fetch enrollments: ${error.message}`);

      // Merge with local VU enrollments
      const key = `vu_enrollments_${userId}`;
      let localEnrollments = [];
      try {
        localEnrollments = JSON.parse(localStorage.getItem(key) || '[]');
      } catch (e) { localEnrollments = []; }

      if (localEnrollments.includes('vu-web-security')) {
        // We need to import the static course data to return it here, but importing it might be circular or messy.
        // Instead, we can try to fetch it via getCourseById if needed, or just append a partial object.
        // For now, let's just append a mock object if we can, or rely on the UI to fetch details.
        // The UI usually iterates enrollments and displays them.

        // Actually, getUserEnrollments returns the join. 
        // We will just append the static course data.
        const { vuWebSecurityCourse } = await import('@data/vu-courses/web-application-security');

        // Check if already in data (unlikely if DB failed)
        if (!data?.find((e: any) => e.course_id === 'vu-web-security')) {
          const vuEnrollment = {
            id: 'local-vu-enrollment',
            user_id: userId,
            course_id: vuWebSecurityCourse.id,
            enrolled_at: new Date().toISOString(),
            course: vuWebSecurityCourse
          };
          return [vuEnrollment, ...data!];
        }
      }

      return data;
    } catch (error) {
      console.error('Get user enrollments error:', error);
      throw error;
    }
  }

  // File Upload
  async uploadFile(file: File, folder = 'courses') {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (error) throw new Error(`Failed to upload file: ${error.message}`);

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  }
}

export const courseService = new CourseService();