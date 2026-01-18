export interface ITeacherProfile {
  id: string;
  name: string;
  primaryDiscipline: string;
  totalCourses: number;
}

export class TeacherProfile implements ITeacherProfile {
  id: string;
  name: string;
  primaryDiscipline: string;
  totalCourses: number;

  constructor({ id, name, primaryDiscipline, totalCourses = 0 }: {
    id: string;
    name: string;
    primaryDiscipline: string;
    totalCourses?: number;
  }) {
    this.id = id;
    this.name = name;
    this.primaryDiscipline = primaryDiscipline;
    this.totalCourses = totalCourses;
  }
}

export interface ITeacherCourse {
  id: string;
  title: string;
  studentCount: number;
}

export class TeacherCourse implements ITeacherCourse {
  id: string;
  title: string;
  studentCount: number;

  constructor({ id, title, studentCount = 0 }: {
    id: string;
    title: string;
    studentCount?: number;
  }) {
    this.id = id;
    this.title = title;
    this.studentCount = studentCount;
  }
}

export interface ITeacherDashboardSummary {
  profile: TeacherProfile;
  courses: TeacherCourse[];
}

export class TeacherDashboardSummary implements ITeacherDashboardSummary {
  profile: TeacherProfile;
  courses: TeacherCourse[];

  constructor({ profile, courses }: {
    profile: TeacherProfile;
    courses: TeacherCourse[];
  }) {
    this.profile = profile;
    this.courses = courses;
  }
}
