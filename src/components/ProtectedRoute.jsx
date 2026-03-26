import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const auth = useAuth();
  const token = localStorage.getItem("nf_token");

  // While Cognito is processing the callback / exchanging tokens, show a loader
  // instead of immediately redirecting (which would lose the auth state)
  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-[#05050A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!token && !auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;