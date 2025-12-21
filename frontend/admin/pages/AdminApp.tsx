import { AuthProvider, useAuth } from '@context/AuthContext';
import { AdminLogin } from '@admin/components/AdminLogin';
import { AdminPortal } from '../components/AdminPortal';

const AdminAppContent = () => {
  const { user, isAdmin } = useAuth();

  if (!user || !isAdmin()) {
    return <AdminLogin />;
  }

  return <AdminPortal />;
};

export const AdminApp = () => (
  <AuthProvider>
    <AdminAppContent />
  </AuthProvider>
);
