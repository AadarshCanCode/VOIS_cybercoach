import { useAuth } from '@context/AuthContext';
import { StudentAppContent } from '@student/components/StudentAppContent';
import { TeacherDashboard } from '@teacher/components/TeacherDashboard';
import { AdminDashboard } from '@admin/components/AdminDashboard';

export const AppContent = () => {
    const { user, loading } = useAuth();


    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF88]"></div>
            </div>
        );
    }

    if (user?.role === 'teacher') {
        return <TeacherDashboard />;
    }

    if (user?.role === 'admin') {
        return <AdminDashboard />;
    }

    return <StudentAppContent />;
};
