
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";
import GeneralSettings from "@/components/settings/GeneralSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import PrivacySettings from "@/components/settings/PrivacySettings";
import HelpSupport from "@/components/settings/HelpSupport";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Get tab from URL query params
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    if (tabParam && ['general', 'notifications', 'privacy', 'help'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  if (!user) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] p-6">
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <p className="text-center mb-6">Please log in to access your settings.</p>
          <Button onClick={() => navigate("/auth")}>Log In</Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideTopControls>
      <div className="pt-4 pb-24 max-w-full">
        <div className="flex items-center mb-6 px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            setActiveTab(value);
            navigate(`/settings${value === 'general' ? '' : `?tab=${value}`}`);
          }}
          className="w-full"
        >
          <div className="px-4 mb-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="px-4 pb-16">
            <TabsContent value="general" className="mt-0">
              <GeneralSettings />
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0">
              <NotificationSettings />
            </TabsContent>
            
            <TabsContent value="privacy" className="mt-0">
              <PrivacySettings />
            </TabsContent>
            
            <TabsContent value="help" className="mt-0">
              <HelpSupport />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default Settings;
