import { type ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface Props {
  children: ReactElement;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props): ReactElement => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-card">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
