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
          teacher_id: courseData.teacher_id,
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

  async getCoursesByTeacher(teacherId: string) {
    try {
      if (!teacherId) {
        console.warn('getCoursesByTeacher called without teacherId');
        return [];
      }

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
      console.log('Starting getAllCourses query from MongoDB...');
      const API_URL = import.meta.env.VITE_API_URL || '';

      const response = await fetch(`${API_URL}/api/teacher/courses/public/all`);
      if (!response.ok) {
        throw new Error('Failed to fetch courses from backend');
      }

      const courses = await response.json();
      console.log(`Successfully fetched ${courses.length} courses from MongoDB`);

      // Map backend fields to frontend interface if needed
      return courses.map((course: any) => ({
        ...course,
        // Ensure mapping is correct
        id: course.id || course._id,
        module_count: course.modules?.length || 0,
        modules: (course.modules || []).map((m: any) => ({
          ...m,
          id: m.id || m._id
        })),
        skills: [] // Mock skills as they are not in DB yet
      }));

    } catch (error) {
      console.error('Get all courses error:', error);
      return [];
    }
  }

  async getCourseById(id: string): Promise<Course | null> {
    // 0. Static Override for VU Course
    if (id === 'vu-web-security') {
      const { vuWebSecurityCourse } = await import('../data/vu-courses/web-application-security');
      return vuWebSecurityCourse;
    }

    try {
      // 1. Try fetching from MongoDB API (New System)
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/teacher/courses/public/${id}`);

      if (response.ok) {
        const course = await response.json();
        // Ensure id is set and modules are present with correct ID mapping
        return {
          ...course,
          id: course.id || course._id,
          modules: (course.modules || []).map((m: any) => ({
            ...m,
            id: m.id || m._id
          }))
        };
      }

      // 2. Fallback to Supabase (Old System)
      // This allows legacy courses to still work if needed
      console.warn('Course not found in MongoDB, trying Supabase fallback...');

      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw new Error(`Failed to fetch course: ${courseError.message}`);
      if (!course) return null;

      let modules = [];

      // Hybrid Storage Retrieval...
      if (course.content_json_url) {
        try {
          const response = await fetch(course.content_json_url);
          if (response.ok) {
            const jsonContent = await response.json();
            if (jsonContent.modules && Array.isArray(jsonContent.modules)) {
              modules = jsonContent.modules;
            }
          }
        } catch (fetchErr) {
          console.error('Failed to fetch hybrid content:', fetchErr);
        }
      }

      if (modules.length === 0) {
        const { data: sqlModules, error: moduleError } = await supabase
          .from('modules')
          .select('*')
          .eq('course_id', id)
          .order('order', { ascending: true });

        if (!moduleError && sqlModules) {
          modules = sqlModules;
        }
      }

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
        // .eq('is_published', true) // Removed
        .order('module_order', { ascending: true });

      if (error) throw new Error(`Failed to fetch modules: ${error.message}`);
      return data;
    } catch (error) {
      console.error('Get modules error:', error);
      throw error;
    }
  }

  // Progress Tracking


  async registerVUStudent(data: any) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const targetUrl = `${API_URL}/api/vu/register`;
      console.log('Registering at:', targetUrl);

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const text = await response.text();
      console.log('Registration Response Status:', response.status);
      console.log('Registration Response Body:', text);

      if (!response.ok) {
        try {
          const err = JSON.parse(text);
          throw new Error(err.message || 'Failed to register');
        } catch (e) {
          console.error('Registration failed with non-JSON response:', text);
          throw new Error(`Registration failed (${response.status}): ${text.substring(0, 50)}...`);
        }
      }
      return text ? JSON.parse(text) : {};
    } catch (error) {
      console.error('VU Registration error:', error);
      throw error;
    }
  }

  async getVUStudent(email: string) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/vu/student/${email}`);
      if (!response.ok) {
        throw new Error('Failed to fetch VU student details');
      }
      return await response.json();
    } catch (error) {
      console.error('Get VU Student error:', error);
      return null;
    }
  }

  async getUserProgress(userId: string, courseId: string) {
    try {
      // Handle static VU courses using MongoDB API
      if (courseId === 'vu-web-security') {
        const email = localStorage.getItem('vu_student_email');
        if (!email) return []; // Not registered locally yet

        try {
          const API_URL = import.meta.env.VITE_API_URL || '';
          const response = await fetch(`${API_URL}/api/vu/progress/${email}/${courseId}`);
          if (response.ok) {
            return await response.json();
          }
          return [];
        } catch (e) {
          console.error('Failed to fetch VU progress:', e);
          return [];
        }
      }

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

  async updateProgress(userId: string, courseId: string, moduleId: string, completed: boolean, quizScore?: number) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';

      // 1. Try Saving to MongoDB (New System)
      // We try this for ALL courses, including VU ones if migrated, or just generic ones.
      // If it fails (e.g. legacy), we fall back.

      const user = await supabase.auth.getUser();
      const email = user.data.user?.email || localStorage.getItem('vu_student_email');

      if (email) {
        try {
          await fetch(`${API_URL}/api/teacher/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentEmail: email,
              courseId,
              moduleId,
              completed,
              quizScore
            })
          });
          // We can return early if we want to fully migrate, but for safety we might also update Supabase if needed?
          // User requested "teacher should be able to progress", which is on MongoDB now.
          // So we prioritize MongoDB.
        } catch (e) {
          console.error('Failed to save progress to MongoDB:', e);
        }
      }

      // 2. Legacy / VU Specific handling (checking if it matches special ID)
      if (courseId === 'vu-web-security' && email) {
        await fetch(`${API_URL}/api/vu/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vu_email: email,
            course_id: courseId,
            module_id: moduleId,
            completed,
            quiz_score: quizScore
          })
        });
        return;
      }

      // 3. Fallback to Supabase for Legacy Courses
      const updates: any = {
        user_id: userId,
        course_id: courseId,
        module_id: moduleId,
        completed,
        updated_at: new Date().toISOString()
      };

      if (quizScore !== undefined) {
        updates.quiz_score = quizScore;
      }

      const { error } = await supabase
        .from('user_progress')
        .upsert([updates]);

      if (error) {
        // Don't throw if we already saved to MongoDB successfully, just warn
        console.warn(`Supabase progress update failed: ${error.message}`);
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
        const { vuWebSecurityCourse } = await import('../data/vu-courses/web-application-security');

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