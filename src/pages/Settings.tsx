
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Bell, Lock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";
import GeneralSettings from "@/components/settings/GeneralSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import PrivacySettings from "@/components/settings/PrivacySettings";
import HelpSupport from "@/components/settings/HelpSupport";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const [activeSection, setActiveSection] = useState("general");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Get section from URL query params
    const searchParams = new URLSearchParams(location.search);
    const sectionParam = searchParams.get('section');
    
    if (sectionParam && ['general', 'notifications', 'privacy', 'help'].includes(sectionParam)) {
      setActiveSection(sectionParam);
    }
  }, [location]);

  const navigateToSection = (section: string) => {
    setActiveSection(section);
    navigate(`/settings${section === 'general' ? '' : `?section=${section}`}`);
  };

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

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return <GeneralSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "privacy":
        return <PrivacySettings />;
      case "help":
        return <HelpSupport />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <MobileLayout hideTopControls>
      <div className="pt-4 pb-24 w-full">
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

        {activeSection === "menu" ? (
          <div className="px-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-28 flex flex-col items-center justify-center gap-2 hover:bg-muted"
                onClick={() => navigateToSection("general")}
              >
                <User className="h-8 w-8 text-fitscore-600" />
                <span>General</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-28 flex flex-col items-center justify-center gap-2 hover:bg-muted"
                onClick={() => navigateToSection("notifications")}
              >
                <Bell className="h-8 w-8 text-fitscore-600" />
                <span>Notifications</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-28 flex flex-col items-center justify-center gap-2 hover:bg-muted"
                onClick={() => navigateToSection("privacy")}
              >
                <Lock className="h-8 w-8 text-fitscore-600" />
                <span>Privacy</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-28 flex flex-col items-center justify-center gap-2 hover:bg-muted"
                onClick={() => navigateToSection("help")}
              >
                <HelpCircle className="h-8 w-8 text-fitscore-600" />
                <span>Help & Support</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-4 pb-20">
            <div className="flex items-center mb-6">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateToSection("menu")}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Menu
              </Button>
              <h2 className="text-xl font-semibold">
                {activeSection === "general" && "General Settings"}
                {activeSection === "notifications" && "Notification Settings"}
                {activeSection === "privacy" && "Privacy Settings"}
                {activeSection === "help" && "Help & Support"}
              </h2>
            </div>
            {renderContent()}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Settings;
