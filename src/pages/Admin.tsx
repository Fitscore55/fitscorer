
import { useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Admin page now serves as a router to separate admin pages
const Admin = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get the active tab from URL or default to dashboard
  const activeTab = searchParams.get('tab') || 'dashboard';
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    } else if (!isLoading && user && isAdmin) {
      // If user is admin, redirect to the proper admin page
      navigate(`/admin/${activeTab}`);
    }
  }, [user, isLoading, isAdmin, navigate, activeTab]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fitscore-500"></div>
      </div>
    );
  }
  
  // Redirect non-admin users to homepage
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return null; // This component just handles routing
};

export default Admin;
