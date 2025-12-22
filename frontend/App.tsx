import { AuthProvider } from '@context/AuthContext';
import { AppContent } from './components/AppContent';
import { FloatingChatbot } from './components/FloatingChatbot';

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
      <FloatingChatbot />
    </AuthProvider>
  );
};

export default App;
