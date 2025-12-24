import React, { useState, useEffect } from 'react';
import { BookOpen, Users, PlusCircle, BarChart, Edit, Trash2, Eye, Star, Clock, Calendar } from 'lucide-react';
import { CourseCreation } from './CourseCreation';
import { LabBuilder } from './LabBuilder/LabBuilder';
import { CourseEditor } from './CourseEditor/CourseEditor';
import { TeacherSidebar } from './TeacherSidebar';
import { courseService } from '@services/courseService';
import type { Course } from '../../types';
import { useAuth } from '@context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Header } from '../../components/layout/Header';

type ViewMode = 'dashboard' | 'lab-builder' | 'course-editor' | 'profile';

export const TeacherDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.id) {
      loadTeacherCourses();
    }
  }, [user]);

  const loadTeacherCourses = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;
      const data = await courseService.getCoursesByTeacher(user.id);
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseService.deleteCourse(courseId);
        setCourses(courses.filter(c => c.id !== courseId));
      } catch (error) {
        console.error('Failed to delete course:', error);
      }
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      const updated = await courseService.updateCourse(course.id, {
        is_published: !course.is_published
      } as Partial<Course>);
      setCourses(courses.map(c => c.id === course.id ? updated : c));
    } catch (error) {
      console.error('Failed to update course:', error);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (viewMode === 'lab-builder') {
      return <LabBuilder />;
    }

    if (viewMode === 'course-editor') {
      return <CourseEditor />;
    }

    if (viewMode === 'profile') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Instructor Profile</h2>
          <p className="text-muted-foreground">Profile management coming soon.</p>
        </div>
      );
    }

    // Dashboard View
    return (
      <div className="p-6 space-y-8 min-h-screen animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent">Teacher Dashboard</h1>
            <p className="text-muted-foreground mt-2 text-lg">Create and manage your cybersecurity courses</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="cyber"
              size="lg"
              onClick={() => setShowCreateForm(true)}
              leftIcon={<PlusCircle className="h-5 w-5" />}
              className="shadow-lg shadow-primary/20"
            >
              Create Course
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card variant="cyber" hover className="relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl group-hover:blur-3xl transition-all duration-500" />
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <p className="text-muted-foreground text-sm font-medium">My Courses</p>
                <p className="text-3xl font-bold text-foreground mt-2">{courses.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <BookOpen className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card variant="cyber" hover className="relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-500/10 blur-2xl group-hover:blur-3xl transition-all duration-500" />
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Published</p>
                <p className="text-3xl font-bold text-foreground mt-2">{courses.filter(c => c.is_published).length}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <Eye className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card variant="cyber" hover className="relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl group-hover:blur-3xl transition-all duration-500" />
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-foreground mt-2">{courses.reduce((sum, c) => sum + (c.enrollment_count || 0), 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card variant="cyber" hover className="relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-yellow-500/10 blur-2xl group-hover:blur-3xl transition-all duration-500" />
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Avg Rating</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {courses.length > 0 ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1) : '0.0'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <BarChart className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <Card variant="glass" className="border-white/5 bg-white/[0.02]">
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white/5 rounded-full p-6 inline-block mb-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">Start creating your first cybersecurity course to share with students.</p>
                <Button
                  variant="cyber"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create Your First Course
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="group bg-white/5 rounded-xl p-6 border border-white/10 hover:border-primary/30 hover:bg-white/[0.07] transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center flex-wrap gap-3">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{course.title}</h3>
                          <Badge variant={
                            course.difficulty === 'advanced' ? 'destructive' :
                              course.difficulty === 'intermediate' ? 'warning' :
                                'success'
                          }>
                            {course.difficulty}
                          </Badge>
                          <Badge variant={course.is_published ? 'success' : 'warning'}>
                            {course.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground line-clamp-2">{course.description}</p>

                        <div className="flex items-center flex-wrap gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            <span>{course.enrollment_count} students</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{(course.rating || 0).toFixed(1)} rating</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>{course.estimated_hours}h estimated</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(course.created_at || Date.now()).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePublish(course)}
                          title={course.is_published ? 'Unpublish' : 'Publish'}
                          className={course.is_published ? 'text-yellow-500 hover:text-yellow-400' : 'text-green-500 hover:text-green-400'}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingCourse(course)}
                          title="Edit"
                          className="text-blue-500 hover:text-blue-400"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCourse(course.id)}
                          title="Delete"
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Creation Modal */}
        {(showCreateForm || editingCourse) && (
          <CourseCreation
            onSuccess={(savedCourse) => {
              if (editingCourse) {
                setCourses(prev => prev.map(c => c.id === savedCourse.id ? savedCourse : c));
              } else {
                setCourses(prev => [savedCourse, ...prev]);
              }
              setShowCreateForm(false);
              setEditingCourse(null);
            }}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingCourse(null);
            }}
            course={editingCourse}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="flex">
        <TeacherSidebar activeTab={viewMode} onTabChange={(tab) => setViewMode(tab as ViewMode)} />
        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};