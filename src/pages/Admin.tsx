
import { useState, useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "@/components/admin/UserManagement";
import ChallengeManagement from "@/components/admin/ChallengeManagement";
import SystemSettings from "@/components/admin/SystemSettings";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const Admin = () => {
  const { toast } = useToast();
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [accessDenied, setAccessDenied] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  
  // Get the active tab from URL or default to dashboard
  const activeTab = searchParams.get('tab') || 'dashboard';
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    } else if (!isLoading && !isAdmin) {
      setAccessDenied(true);
    }
  }, [user, isLoading, isAdmin, navigate]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fitscore-500"></div>
      </div>
    );
  }
  
  // Redirect non-admin users to homepage
  if (accessDenied) {
    return <Navigate to="/" replace />;
  }

  // Only render admin panel if user is authenticated and is admin
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className={`grid ${isMobile ? 'grid-cols-2 gap-2 mb-4' : 'grid-cols-4 mb-4'}`}>
            {isMobile ? (
              // Mobile view: show 2 tabs per row
              <>
                <div className="col-span-2 grid grid-cols-2 gap-2">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-2">
                  <TabsTrigger value="challenges">Challenges</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </div>
              </>
            ) : (
              // Desktop view: show all tabs in one row
              <>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="challenges">Challenges</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </>
            )}
          </TabsList>
          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          <TabsContent value="challenges">
            <ChallengeManagement />
          </TabsContent>
          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Admin;
