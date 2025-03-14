
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import SystemSettings from "@/components/admin/SystemSettings";
import { useAuth } from "@/contexts/AuthContext";

const AdminSettingsPage = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fitscore-500"></div>
      </div>
    );
  }
  
  // Redirect non-admin users to homepage
  if (!isLoading && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout>
      <SystemSettings />
    </AdminLayout>
  );
};

export default AdminSettingsPage;
