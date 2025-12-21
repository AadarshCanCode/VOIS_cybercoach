import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { LandingPage } from './Landing/LandingPage';
import { AdminLogin } from '@admin/components/AdminLogin';
import { Dashboard } from './Dashboard/Dashboard';
import { TeacherDashboard } from '@teacher/components/TeacherDashboard';
import { AssessmentTest } from './Assessment/AssessmentTest';
import { ProctoringDemo } from './Assessment/ProctoringDemo';
import { CourseList } from './Courses/CourseList';
import { CourseDetail } from './Courses/CourseDetail';
import { AssessmentAnalytics } from '@admin/components/AssessmentAnalytics';
import { LabsList } from './Labs/LabsList';
import { LabViewer } from './Labs/LabViewer';
import { Certificates } from './Certificates/Certificates';
import { Profile } from './Profile/Profile';
import { Chatbot } from './Chatbot/Chatbot';
import { VideoLibrary } from './Video/VideoLibrary';
import { TechnicalQuestions } from './TechnicalInterview/TechnicalQuestions';
import { NotesTab } from './Notes/NotesTab';
import { CommunityPage } from './Community/CommunityPage';
import { CompanyVerification } from './Verification/CompanyVerification';
import { BountyBoard } from './Career/BountyBoard';
import { InterviewBot } from './Career/InterviewBot';
import { ResumeGenerator } from './Career/ResumeGenerator';
import { PricingPage } from './Subscription/PricingPage';
import { VulnerabilityAnalyzer } from './Tools/VulnerabilityAnalyzer';
import '../styles/student.css';

interface StudentAppContentProps {
  initialTab?: string;
}

export const StudentAppContent: React.FC<StudentAppContentProps> = ({ initialTab }) => {
  const { user, isAdmin, isTeacher } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<'home' | 'admin' | 'app'>('home');

  useEffect(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get('tab');

    if (path === '/admin') {
      setCurrentRoute('admin');
      return;
    }

    // Handle deep linking for tabs
    if (tabParam && ['community', 'verification', 'proctor-demo', 'landing', 'pricing', 'analyzer'].includes(tabParam)) {
      setActiveTab(tabParam);
      if (user) {
        setCurrentRoute('app');
      }
      return;
    }

    if (initialTab) {
      setActiveTab(initialTab);
      if (user) {
        setCurrentRoute('app');
      }
      return;
    }

    if (path === '/proctor-demo') {
      setActiveTab('proctor-demo');
      setCurrentRoute('app');
      return;
    }

    if (user) {
      setCurrentRoute('app');
    } else {
      setCurrentRoute('home');
    }
  }, [user, initialTab]);

  const handleLoginSuccess = (targetTab?: string) => {
    if (targetTab) {
      setActiveTab(targetTab);
    }
    setCurrentRoute('app');
    if (window.location.pathname === '/admin') {
      window.history.pushState({}, '', '/');
    }
  };

  if (currentRoute === 'admin') {
    if (user && isAdmin()) {
      setCurrentRoute('app');
      return null;
    }
    return (
      <AdminLogin
        onBack={() => {
          setCurrentRoute('home');
          window.history.pushState({}, '', '/');
        }}
        onSuccess={handleLoginSuccess}
      />
    );
  }

  if (!user) {
    return <LandingPage onLogin={handleLoginSuccess} />;
  }

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const handleLabSelect = (labId: string) => {
    setSelectedLabId(labId);
  };

  const renderContent = () => {
    if (activeTab === 'courses' && selectedCourseId) {
      return <CourseDetail courseId={selectedCourseId} onBack={() => setSelectedCourseId(null)} />;
    }

    if (activeTab === 'labs' && selectedLabId) {
      return <LabViewer labId={selectedLabId} onBack={() => setSelectedLabId(null)} />;
    }

    if (activeTab === 'landing') {
      return <LandingPage onLogin={handleLoginSuccess} />;
    }

    switch (activeTab) {
      case 'analytics':
        return isAdmin() ? <AssessmentAnalytics /> : <Dashboard />;
      case 'my-courses':
      case 'create-course':
      case 'students':
        return isTeacher() ? <TeacherDashboard /> : <Dashboard />;
      case 'dashboard':
        return <Dashboard />;
      case 'assessment':
        return isAdmin() ? <AssessmentAnalytics /> : <AssessmentTest />;
      case 'proctor-demo':
        return <ProctoringDemo />;
      case 'courses':
        return <CourseList onCourseSelect={handleCourseSelect} />;
      case 'videos':
        return <VideoLibrary />;
      case 'labs':
        return <LabsList onLabSelect={handleLabSelect} />;
      case 'technical':
        return <TechnicalQuestions />;
      case 'certificates':
        return <Certificates />;
      case 'notes':
        return <NotesTab />;
      case 'profile':
        return <Profile />;
      case 'community':
        return <CommunityPage onBack={() => setActiveTab('landing')} />;
      case 'verification':
        return <CompanyVerification />;
      case 'career':
        return <BountyBoard />;
      case 'interview':
        return <InterviewBot />;
      case 'resume':
        return <ResumeGenerator />;
      case 'pricing':
        return <PricingPage />;
      case 'analyzer':
        return <VulnerabilityAnalyzer />;
      default:
        return <Dashboard />;
    }
  };

  const isFullPage = ['community', 'verification', 'landing', 'analyzer'].includes(activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Header onChatToggle={() => setIsChatOpen(!isChatOpen)} />
      <div className="flex">
        {!isFullPage && <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />}
        <main className="flex-1">{renderContent()}</main>
      </div>
      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};
