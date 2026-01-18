import { useAuth } from '@context/AuthContext';
import { StudentAppContent } from '@student/components/StudentAppContent';
import { TeacherDashboard } from '@teacher/components/TeacherDashboard';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LandingPage } from '@student/components/Landing/LandingPage';
import { LoginForm } from '@student/components/Auth/LoginForm';
import { RegisterForm } from '@student/components/Auth/RegisterForm';
import { CommunityPage } from '@student/components/Community/CommunityPage';
import { VerifyCertificate } from '@student/pages/VerifyCertificate';
import { SEO } from './SEO/SEO';

export const AppContent = () => {
    const { user, loading, isTeacher } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF88]"></div>
            </div>
        );
    }

    return (
        <>
            <SEO />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                    user ? (
                        isTeacher() ? <Navigate to="/teacher" replace /> : <StudentAppContent />
                    ) : <LandingPage />
                } />

                <Route path="/login" element={
                    user ? <Navigate to="/" replace /> : <LoginForm />
                } />

                <Route path="/signup" element={
                    user ? <Navigate to="/" replace /> : <RegisterForm />
                } />

                {/* Public Tool Routes */}
                <Route path="/verify/:userId" element={<VerifyCertificate />} />
                <Route path="/community" element={<CommunityPage onBack={() => navigate('/')} />} />

                {/* Protected Student Routes */}
                <Route path="/dashboard" element={
                    user ? <StudentAppContent initialTab="dashboard" /> : <Navigate to="/login" replace />
                } />

                {/* Protected Teacher Routes */}
                <Route path="/teacher/*" element={
                    user ? (isTeacher() ? <TeacherDashboard /> : <Navigate to="/" replace />) : <LoginForm userType="teacher" />
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
};
