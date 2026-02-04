import { AuthProvider } from '@context/AuthContext';
import { LearningProvider } from '@context/LearningContext';
import { AppContent } from './components/AppContent';
import { FloatingChatbot } from './components/FloatingChatbot';
import { BrowserRouter } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LearningProvider>
          <AppContent />
          <FloatingChatbot />
        </LearningProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
