import { StudentDashboardSummary, StudentCourseSummary, StudentProfile } from '../models/studentModel.js';

const sampleProfile = new StudentProfile({
  id: 'student-001',
  name: 'Demo Student',
  enrolledCourses: ['netsec-basics', 'ethical-hacking-101'],
  upcomingAssessments: ['assessment-001'],
  lastLogin: new Date().toISOString()
});

const sampleCourses: StudentCourseSummary[] = [
  new StudentCourseSummary({ id: 'netsec-basics', title: 'Network Security Basics', progress: 0.65 }),
  new StudentCourseSummary({ id: 'ethical-hacking-101', title: 'Ethical Hacking 101', progress: 0.42 })
];

export function getStudentDashboardSummary(): StudentDashboardSummary {
  const completedCourses = sampleCourses.filter(course => course.progress >= 1).length;
  const activeCourses = sampleCourses.length - completedCourses;

  return new StudentDashboardSummary({
    profile: sampleProfile,
    stats: {
      completedCourses,
      activeCourses,
      courseSummaries: sampleCourses
    }
  });
}
