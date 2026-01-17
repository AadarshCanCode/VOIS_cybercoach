import { useAuth } from '@context/AuthContext';
import { StudentAppContent } from '@student/components/StudentAppContent';
import { TeacherDashboard } from '@teacher/components/TeacherDashboard';
import { AdminDashboard } from '@admin/components/AdminDashboard';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LandingPage } from '@student/components/Landing/LandingPage';
import { LoginForm } from '@student/components/Auth/LoginForm';
import { RegisterForm } from '@student/components/Auth/RegisterForm';
import { AdminLogin } from '@admin/components/AdminLogin';
import { CompanyVerification } from '@student/components/Verification/CompanyVerification';
import { CommunityPage } from '@student/components/Community/CommunityPage';
import { VulnerabilityAnalyzer } from '@student/components/Tools/VulnerabilityAnalyzer';
import { VerifyCertificate } from '@student/pages/VerifyCertificate';
import { SEO } from './SEO/SEO';

export const AppContent = () => {
    const { user, loading, isAdmin, isTeacher } = useAuth();
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
                        isTeacher() ? <Navigate to="/teacher" replace /> :
                            isAdmin() ? <Navigate to="/admin" replace /> :
                                <StudentAppContent />
                    ) : <LandingPage />
                } />

                <Route path="/login" element={
                    user ? <Navigate to="/" replace /> : <LoginForm />
                } />

                <Route path="/signup" element={
                    user ? <Navigate to="/" replace /> : <RegisterForm />
                } />

                <Route path="/admin/login" element={
                    user && isAdmin() ? <Navigate to="/admin" replace /> : <AdminLogin />
                } />

                {/* Public Tool Routes */}
                <Route path="/verify-target" element={<CompanyVerification />} />
                <Route path="/verify/:userId" element={<VerifyCertificate />} />
                <Route path="/community" element={<CommunityPage onBack={() => navigate('/')} />} />
                <Route path="/analyze-target" element={<VulnerabilityAnalyzer />} />

                {/* Protected Student Routes */}
                <Route path="/dashboard" element={
                    user ? <StudentAppContent initialTab="dashboard" /> : <Navigate to="/login" replace />
                } />

                {/* Protected Teacher Routes */}
                <Route path="/teacher/*" element={
                    user ? (isTeacher() ? <TeacherDashboard /> : <Navigate to="/" replace />) : <LoginForm userType="teacher" />
                } />

                {/* Protected Admin Routes */}
                <Route path="/admin/*" element={
                    user && isAdmin() ? <AdminDashboard /> : <Navigate to="/admin/login" replace />
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
};
