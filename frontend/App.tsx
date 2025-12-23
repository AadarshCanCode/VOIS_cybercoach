import { AuthProvider } from '@context/AuthContext';
import { AppContent } from './components/AppContent';
import { FloatingChatbot } from './components/FloatingChatbot';
import { BrowserRouter } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <FloatingChatbot />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
