import { AuthProvider, useAuth } from '@context/AuthContext';
import { TeacherDashboardShell } from '../components/TeacherDashboardShell';

const TeacherAppContent = () => {
  const { user, isTeacher } = useAuth();

  if (!user || !isTeacher()) {
    return (
      <div className="teacher-shell">
        <p className="teacher-shell__notice">Teacher access only. Please sign in with a teacher account.</p>
      </div>
    );
  }

  return <TeacherDashboardShell />;
};

export const TeacherApp = () => (
  <AuthProvider>
    <TeacherAppContent />
  </AuthProvider>
);
