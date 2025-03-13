
import { useState } from "react";
import { Shield } from "lucide-react";
import { Navigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "@/components/admin/UserManagement";
import ChallengeManagement from "@/components/admin/ChallengeManagement";
import SystemSettings from "@/components/admin/SystemSettings";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { toast } = useToast();
  
  // In a real app, this would come from an auth provider
  // For now we're simulating by checking if the user email matches our superuser
  const currentUserEmail = "fitscore55@gmail.com"; // In a real app, this would be fetched from auth state
  const isAdmin = currentUserEmail === "fitscore55@gmail.com";
  
  // Redirect non-admin users to homepage with a toast message
  if (!isAdmin) {
    // Show unauthorized access toast
    toast({
      variant: "destructive",
      title: "Access Denied",
      description: "You don't have permission to access the admin panel.",
    });
    
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-fitscore-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-fitscore-600 to-fitscore-500 bg-clip-text text-transparent">Admin Panel</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-fitscore-600">{currentUserEmail}</span> (Superuser)
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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
