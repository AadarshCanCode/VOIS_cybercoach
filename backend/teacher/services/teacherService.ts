import { TeacherProfile, TeacherCourse, TeacherDashboardSummary } from '../models/teacherModel.js';

const sampleTeacher = new TeacherProfile({
  id: 'teacher-001',
  name: 'Demo Teacher',
  primaryDiscipline: 'Cybersecurity',
  totalCourses: 3
});

const sampleTeacherCourses: TeacherCourse[] = [
  new TeacherCourse({ id: 'csec-001', title: 'Cybersecurity Fundamentals', studentCount: 42 }),
  new TeacherCourse({ id: 'csec-002', title: 'Advanced Pen Testing', studentCount: 28 }),
  new TeacherCourse({ id: 'csec-003', title: 'Secure Coding Practices', studentCount: 35 })
];

export function getTeacherDashboardOverview(): TeacherDashboardSummary {
  return new TeacherDashboardSummary({
    profile: sampleTeacher,
    courses: sampleTeacherCourses
  });
}
