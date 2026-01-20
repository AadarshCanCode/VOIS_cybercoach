import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Award, Lock, CheckCircle } from 'lucide-react';
import { courseService } from '@services/courseService';
import type { Course } from '@types';

export interface CourseData {
  id: string;
  title: string;
  category: 'vishwakarma-university';
  url: string;
  description: string;
  disclaimer: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  skills: string[];
}

export interface CourseCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const courseCategories: CourseCategory[] = [
  {
    id: 'vishwakarma-university',
    title: 'Vishwakarma University',
    description: 'Exclusive curriculum and specialized tracks from VU',
    icon: '🎓',
    color: 'from-purple-500/20 to-pink-500/20'
  }
];

const DYNAMIC_CATEGORY: CourseCategory = {
  id: 'cyber-ops',
  title: 'Cyber Operations',
  description: 'AI-generated specialized training missions',
  icon: '⚡',
  color: 'from-green-500/20 to-emerald-500/20'
};

interface CourseListProps {
  onCourseSelect: (courseId: string) => void;
}

export const CourseList: React.FC<CourseListProps> = ({ onCourseSelect }) => {
  // const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [dynamicCourses, setDynamicCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const courses = await courseService.getAllCourses();
        setDynamicCourses(courses);
      } catch (e) {
        console.error('Failed to fetch dynamic courses:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const canAccessCourses = true;

  // Course Disclaimer Modal
  if (selectedCourse) {
    if (!canAccessCourses) {
      setSelectedCourse(null);
      return null;
    }

    return (
      <div className="p-6 min-h-screen animate-fade-in text-[#EAEAEA]">
        <div className="max-w-4xl mx-auto space-y-6">
          <button
            onClick={() => setSelectedCourse(null)}
            className="flex items-center space-x-2 text-[#00B37A] hover:text-[#00FF88] transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Courses</span>
          </button>

          <div className="bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 overflow-hidden">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-black tracking-tighter text-white mb-2">
                    {selectedCourse.title}
                  </h1>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedCourse.difficulty === 'Beginner' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                      selectedCourse.difficulty === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                        'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                      {selectedCourse.difficulty}
                    </span>
                    <div className="flex items-center space-x-1 text-[#00B37A]">
                      <Clock className="h-4 w-4" />
                      <span>{selectedCourse.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[#00B37A] text-lg mb-6">
                {selectedCourse.description}
              </p>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#00FF88] uppercase tracking-wider mb-3">What You'll Learn</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCourse.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88] text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-yellow-500 mb-1">Important Notice</h4>
                    <p className="text-yellow-500/80 text-sm">
                      {selectedCourse.disclaimer}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (selectedCourse.url && selectedCourse.url !== '#') {
                    window.open(selectedCourse.url, '_blank');
                  } else {
                    onCourseSelect(selectedCourse.id);
                  }
                }}
                className="w-full bg-[#00FF88] text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#00CC66] hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all flex items-center justify-center space-x-2"
              >
                <span>{selectedCourse.id === 'vu-web-security' ? 'Enter Course' : 'Start Course'}</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show courses for selected category
  if (selectedCategory) {
    const category = courseCategories.find(c => c.id === selectedCategory);

    // Define courses dynamically based on category
    let courses: CourseData[] = [];

    if (selectedCategory === 'vishwakarma-university') {
      courses = [
        {
          id: 'vu-web-security',
          title: 'Web Application Security',
          category: 'vishwakarma-university',
          url: '#',
          description: 'Learn to identify and exploit vulnerabilities in web applications, understanding the OWASP Top 10 and secure coding practices, tailored for VU curriculum.',
          disclaimer: 'Exclusive for VU students. This course contains practical exercises involving security testing.',
          difficulty: 'Intermediate',
          duration: '8 weeks',
          skills: ['OWASP Top 10', 'SQL Injection', 'XSS', 'VU-Certified']
        }
      ];
    } else if (selectedCategory === 'cyber-ops') {
      courses = dynamicCourses.map(c => ({
        id: c.id,
        title: c.title,
        category: 'vishwakarma-university' as any, // Mock for now
        url: '#',
        description: c.description || 'No description available.',
        disclaimer: 'This mission is dynamically generated. Exercise caution during practical sessions.',
        difficulty: (c.difficulty ? (c.difficulty.charAt(0).toUpperCase() + c.difficulty.slice(1)) : 'Beginner') as any,
        duration: c.estimated_hours ? `${c.estimated_hours} hours` : 'Self-paced',
        skills: c.category ? [c.category] : ['Cybersecurity']
      }));
    }

    return (
      <div className="p-6 min-h-screen animate-fade-in text-[#EAEAEA]">
        <div className="max-w-6xl mx-auto space-y-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center space-x-2 text-[#00B37A] hover:text-[#00FF88] transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Categories</span>
          </button>

          <div className="border-b border-[#00FF88]/10 pb-6">
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase mb-2">
              <span className="mr-3">{category?.icon}</span>
              {category?.title}
            </h1>
            <p className="text-[#00B37A] font-mono text-sm">{category?.description.toUpperCase()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.length > 0 ? courses.map((course) => (
              <div
                key={course.id}
                onClick={() => canAccessCourses && setSelectedCourse(course)}
                className={`bg-[#0A0F0A] rounded-xl border border-[#00FF88]/10 overflow-hidden group transition-all duration-300 relative ${canAccessCourses ? 'cursor-pointer hover:border-[#00FF88]/30' : 'opacity-40 cursor-not-allowed'
                  }`}
              >
                {!canAccessCourses && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="h-12 w-12 text-white/40 mx-auto mb-2" />
                      <p className="text-white/60 font-bold text-xs">ASSESSMENT REQUIRED</p>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white mb-2 group-hover:text-[#00FF88] transition-colors">
                        {course.title}
                      </h2>
                      <p className="text-[#00B37A] text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-[#EAEAEA]/60">
                      <span className={`px-2 py-1 rounded ${course.difficulty === 'Beginner' ? 'bg-green-500/10 text-green-500' :
                        course.difficulty === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                        {course.difficulty}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                    {canAccessCourses && (
                      <div className="text-[#00FF88] text-sm font-bold group-hover:translate-x-1 transition-transform">
                        View Details →
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#00FF88]/10">
                    <div className="flex flex-wrap gap-1.5">
                      {course.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[#00FF88]/5 text-[#00FF88] text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {course.skills.length > 3 && (
                        <span className="px-2 py-0.5 text-[#00B37A] text-xs">
                          +{course.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <p>No courses available in this category yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Category Selection View
  return (
    <div className="p-6 min-h-screen animate-fade-in text-[#EAEAEA]">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-[#00FF88]/10 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase">
              Training <span className="text-[#00FF88]">Paths</span>
            </h1>
            <p className="text-[#00B37A] font-mono text-sm mt-1">CHOOSE YOUR SPECIALIZATION</p>
          </div>
          <div className="h-10 w-10 rounded bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center">
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-[#00FF88] border-t-transparent rounded-full" />
            ) : (
              <Award className="h-5 w-5 text-[#00FF88]" />
            )}
          </div>
        </div>

        {!canAccessCourses && (
          <div className="bg-[#0A0F0A] border border-yellow-500/20 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors" />
            <div className="relative flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                <svg className="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-yellow-500 uppercase tracking-wider">Access Restricted</h3>
                <p className="text-yellow-500/80 text-sm mt-1">
                  Complete the initial assessment to unlock training modules.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...courseCategories, ...(dynamicCourses.length > 0 ? [DYNAMIC_CATEGORY] : [])].map((category) => {
            const coursesCount = category.id === 'cyber-ops'
              ? dynamicCourses.length
              : (category.id === 'vishwakarma-university' ? 1 : 0);

            return (
              <div
                key={category.id}
                onClick={() => canAccessCourses && setSelectedCategory(category.id)}
                className={`bg-gradient-to-br ${category.color} rounded-xl border border-[#00FF88]/10 overflow-hidden group transition-all duration-300 relative ${canAccessCourses ? 'cursor-pointer hover:border-[#00FF88]/30' : 'opacity-40 cursor-not-allowed'
                  }`}
              >
                {!canAccessCourses && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="h-16 w-16 text-white/40 mx-auto mb-3" />
                      <p className="text-white/60 font-bold text-sm">LOCKED</p>
                      <p className="text-white/40 text-xs mt-1">Complete Assessment</p>
                    </div>
                  </div>
                )}
                <div className="bg-[#0A0F0A]/80 backdrop-blur-sm p-8 h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="text-5xl">{category.icon}</div>
                      <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight group-hover:text-[#00FF88] transition-colors">
                          {category.title}
                        </h2>
                        <p className="text-[#00B37A] text-sm mt-1">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {coursesCount > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-[#EAEAEA]/60">
                        <CheckCircle className="h-4 w-4 text-[#00FF88]" />
                        <span>{coursesCount} Comprehensive Courses</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-[#EAEAEA]/60">
                      <Clock className="h-4 w-4 text-[#00FF88]" />
                      <span>Self-paced Learning</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-[#EAEAEA]/60">
                      <Award className="h-4 w-4 text-[#00FF88]" />
                      <span>Industry Recognition</span>
                    </div>
                  </div>

                  {canAccessCourses && coursesCount > 0 && (
                    <div className="flex items-center justify-between pt-4 border-t border-[#00FF88]/10">
                      <span className="text-[#00B37A] text-sm font-mono">EXPLORE {coursesCount} COURSES</span>
                      <svg className="h-6 w-6 text-[#00FF88] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
