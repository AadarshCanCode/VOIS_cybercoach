import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { Header } from '@components/layout/Header';
import { Sidebar } from '@components/layout/Sidebar';
import { LandingPage } from './Landing/LandingPage';
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
import { VideoLibrary } from './Video/VideoLibrary';
import { TechnicalQuestions } from './TechnicalInterview/TechnicalQuestions';
import { NotesTab } from './Notes/NotesTab';
import { CommunityPage } from './Community/CommunityPage';
import '../styles/student.css';

interface StudentAppContentProps {
  initialTab?: string;
}

export const StudentAppContent: React.FC<StudentAppContentProps> = ({ initialTab }) => {
  const { user, isAdmin, isTeacher } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Listen for navigation events from assessment completion
  useEffect(() => {
    const handleNavigateToTab = (e: CustomEvent<{ tab: string; labId?: string }>) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
        // Clear selected items unless specific ID provided
        setSelectedCourseId(null);
        if (e.detail.labId) {
          setSelectedLabId(e.detail.labId);
        } else {
          setSelectedLabId(null);
        }
      }
    };

    window.addEventListener('navigateToTab', handleNavigateToTab as EventListener);
    return () => {
      window.removeEventListener('navigateToTab', handleNavigateToTab as EventListener);
    };
  }, []);

  if (!user) {
    return <LandingPage />;
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
      return <LandingPage />;
    }

    switch (activeTab) {
      case 'analytics':
        return isAdmin() ? <AssessmentAnalytics /> : <Dashboard onTabChange={setActiveTab} />;
      case 'my-courses':
      case 'create-course':
      case 'students':
        return isTeacher() ? <TeacherDashboard /> : <Dashboard onTabChange={setActiveTab} />;
      case 'dashboard':
        return <Dashboard onTabChange={setActiveTab} />;
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
        return <CommunityPage onBack={() => setActiveTab('dashboard')} />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  const isFullPage = ['community', 'landing'].includes(activeTab);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="flex">
        {!isFullPage && <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />}
        <main className="flex-1">{renderContent()}</main>
      </div>
    </div>
  );
};
