
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Bell, Lock, HelpCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";
import GeneralSettings from "@/components/settings/GeneralSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import PrivacySettings from "@/components/settings/PrivacySettings";
import HelpSupport from "@/components/settings/HelpSupport";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const [activeSection, setActiveSection] = useState("menu");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Get section from URL query params
    const searchParams = new URLSearchParams(location.search);
    const sectionParam = searchParams.get('section');
    
    if (sectionParam && ['general', 'notifications', 'privacy', 'help'].includes(sectionParam)) {
      setActiveSection(sectionParam);
    } else {
      setActiveSection("menu");
    }
  }, [location]);

  const navigateToSection = (section: string) => {
    setActiveSection(section);
    navigate(`/settings${section === 'menu' ? '' : `?section=${section}`}`);
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
        return null;
    }
  };

  return (
    <MobileLayout hideTopControls>
      <div className="pt-4 pb-24 w-full max-w-md mx-auto">
        <div className="flex items-center mb-6 px-4">
          {activeSection !== "menu" ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigateToSection("menu")}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-2xl font-bold">
            {activeSection === "menu" ? "Settings" : 
              activeSection === "general" ? "General Settings" :
              activeSection === "notifications" ? "Notification Settings" :
              activeSection === "privacy" ? "Privacy Settings" : 
              "Help & Support"}
          </h1>
        </div>

        {activeSection === "menu" ? (
          <div className="px-4">
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="divide-y">
                <SettingsMenuItem 
                  icon={<User className="w-5 h-5 text-fitscore-600" />} 
                  title="General"
                  onClick={() => navigateToSection("general")}
                />
                <SettingsMenuItem 
                  icon={<Bell className="w-5 h-5 text-fitscore-600" />} 
                  title="Notifications"
                  onClick={() => navigateToSection("notifications")}
                />
                <SettingsMenuItem 
                  icon={<Lock className="w-5 h-5 text-fitscore-600" />} 
                  title="Privacy"
                  onClick={() => navigateToSection("privacy")}
                />
                <SettingsMenuItem 
                  icon={<HelpCircle className="w-5 h-5 text-fitscore-600" />} 
                  title="Help & Support"
                  onClick={() => navigateToSection("help")}
                />
              </div>
            </div>
            
            <div className="mt-8">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => navigate("/auth")}
              >
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-4">
            {renderContent()}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

interface SettingsMenuItemProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

const SettingsMenuItem = ({ icon, title, onClick }: SettingsMenuItemProps) => {
  return (
    <button 
      className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{title}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
};

export default Settings;
