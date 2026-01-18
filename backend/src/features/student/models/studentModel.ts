export interface IStudentProfile {
  id: string;
  name: string;
  enrolledCourses: string[];
  upcomingAssessments: string[];
  lastLogin: string | null;
}

export class StudentProfile implements IStudentProfile {
  id: string;
  name: string;
  enrolledCourses: string[];
  upcomingAssessments: string[];
  lastLogin: string | null;

  constructor({ id, name, enrolledCourses = [], upcomingAssessments = [], lastLogin = null }: {
    id: string;
    name: string;
    enrolledCourses?: string[];
    upcomingAssessments?: string[];
    lastLogin?: string | null;
  }) {
    this.id = id;
    this.name = name;
    this.enrolledCourses = enrolledCourses;
    this.upcomingAssessments = upcomingAssessments;
    this.lastLogin = lastLogin;
  }
}

export interface IStudentCourseSummary {
  id: string;
  title: string;
  progress: number;
}

export class StudentCourseSummary implements IStudentCourseSummary {
  id: string;
  title: string;
  progress: number;

  constructor({ id, title, progress = 0 }: {
    id: string;
    title: string;
    progress?: number;
  }) {
    this.id = id;
    this.title = title;
    this.progress = progress;
  }
}

export interface IStudentDashboardStats {
  completedCourses: number;
  activeCourses: number;
  courseSummaries: StudentCourseSummary[];
}

export interface IStudentDashboardSummary {
  profile: StudentProfile;
  stats: IStudentDashboardStats;
}

export class StudentDashboardSummary implements IStudentDashboardSummary {
  profile: StudentProfile;
  stats: IStudentDashboardStats;

  constructor({ profile, stats }: {
    profile: StudentProfile;
    stats: IStudentDashboardStats;
  }) {
    this.profile = profile;
    this.stats = stats;
  }
}
