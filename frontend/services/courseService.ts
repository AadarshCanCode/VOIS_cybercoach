import { supabase } from '@lib/supabase';
import type { Course, Module } from '@types';

class CourseService {
  // Course Management
  async createCourse(courseData: Partial<Course>) {
    try {
      console.log('Creating course with data:', courseData);

      const { data, error } = await supabase
        .from('courses')
        .insert([{
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          difficulty: courseData.difficulty,
          estimated_hours: courseData.estimated_hours || 0,
          teacher_id: courseData.teacher_id,
          is_published: courseData.is_published || false,
          enrollment_count: 0,
          rating: 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to create course: ${error.message}`);
      }

      console.log('Course created successfully:', data);
      return data;
    } catch (error) {
      console.error('Create course error:', error);
      throw error;
    }
  }

  async updateCourse(id: string, updates: Partial<Course>) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update course: ${error.message}`);
      return data;
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

  async getCoursesByTeacher(teacherId: string) {
    try {
      // First get courses without join to avoid relationship issues
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (coursesError) {
        console.error('Courses query error:', coursesError);
        throw new Error(`Failed to fetch teacher courses: ${coursesError.message}`);
      }

      // Get teacher info separately
      const { data: teacherData, error: teacherError } = await supabase
        .from('users')
        .select('name, email, profile_image')
        .eq('id', teacherId)
        .single();

      if (teacherError) {
        console.error('Teacher query error:', teacherError);
        // Continue without teacher data if needed
      }

      // Combine the data
      const coursesWithTeacher = coursesData?.map((course: Course) => ({
        ...course,
        teacher: teacherData || null
      })) || [];

      return coursesWithTeacher;
    } catch (error) {
      console.error('Get teacher courses error:', error);
      throw error;
    }
  }

  async getAllCourses(): Promise<Course[]> {
    try {
      // Simplified query without join to avoid relationship issues
      // Select courses and include related modules if relationship exists
      const { data, error } = await supabase
        .from('courses')
        .select(`*, modules(*)`)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw new Error(`Failed to fetch courses: ${error.message}`);
      return (data as Course[]) || [];
    } catch (error) {
      console.error('Get all courses error:', error);
      throw error;
    }
  }

  async getCourseById(id: string): Promise<Course | null> {
    try {
      // 1. Get Course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw new Error(`Failed to fetch course: ${courseError.message}`);
      if (!course) return null;

      // 2. Get Modules
      const { data: modules, error: moduleError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', id)
        .eq('is_published', true)
        .order('order', { ascending: true });

      if (moduleError) console.warn('Failed to fetch modules for course:', moduleError);

      return {
        ...course,
        modules: modules || []
      } as Course;
    } catch (error) {
      console.error('Get course by id error:', error);
      throw error;
    }
  }

  async getModuleCount(courseId: string): Promise<number> {
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
          module_order: currentCount + 1,
          is_published: false
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
        .eq('is_published', true)
        .order('module_order', { ascending: true });

      if (error) throw new Error(`Failed to fetch modules: ${error.message}`);
      return data;
    } catch (error) {
      console.error('Get modules error:', error);
      throw error;
    }
  }

  // Progress Tracking
  async updateProgress(progressData: unknown) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .upsert([progressData])
        .select()
        .single();

      if (error) throw new Error(`Failed to update progress: ${error.message}`);
      return data;
    } catch (error) {
      console.error('Update progress error:', error);
      throw error;
    }
  }

  async getUserProgress(userId: string, courseId: string) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (error) throw new Error(`Failed to fetch user progress: ${error.message}`);
      return data;
    } catch (error) {
      console.error('Get user progress error:', error);
      throw error;
    }
  }

  // Enrollment Management
  async enrollInCourse(userId: string, courseId: string) {
    try {
      // Avoid double-enrollments
      const { data: existing, error: existingErr } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      if (existingErr) {
        console.warn('Error checking existing enrollment:', existingErr.message);
      }

      if (existing) return existing;

      const { data: inserted, error: insertErr } = await supabase
        .from('course_enrollments')
        .insert([{ user_id: userId, course_id: courseId }])
        .select()
        .single();

      if (insertErr) throw new Error(`Failed to enroll in course: ${insertErr.message}`);

      // Increment enrollment_count on courses table
      try {
        const { error: updateErr } = await supabase
          .from('courses')
          .update({ enrollment_count: (inserted.enrollment_count ?? 0) + 1 })
          .eq('id', courseId)
          .select()
          .single();
        if (updateErr) {
          // fallback: try to increment by fetching the course value and updating
          const { data: courseRow } = await supabase.from('courses').select('enrollment_count').eq('id', courseId).maybeSingle();
          const newCount = (courseRow?.enrollment_count ?? 0) + 1;
          await supabase.from('courses').update({ enrollment_count: newCount }).eq('id', courseId);
        }
      } catch (e) {
        console.warn('Failed to increment course enrollment_count (non-fatal):', e);
      }

      return inserted;
    } catch (error) {
      console.error('Enroll in course error:', error);
      throw error;
    }
  }

  async getUserEnrollments(userId: string) {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:courses(
            *,
            teacher:users(name, profile_image)
          )
        `)
        .eq('user_id', userId)
        .order('enrolled_at', { ascending: false });

      if (error) throw new Error(`Failed to fetch enrollments: ${error.message}`);
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