
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import GeneralSettings from "@/components/settings/GeneralSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import PrivacySettings from "@/components/settings/PrivacySettings";
import HelpSupport from "@/components/settings/HelpSupport";

interface ProfileSettingsProps {
  activeSection: string | null;
  onBack: () => void;
}

const ProfileSettings = ({ activeSection, onBack }: ProfileSettingsProps) => {
  const renderSettingsContent = () => {
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

  const getSectionTitle = () => {
    switch (activeSection) {
      case "general":
        return "General Settings";
      case "notifications":
        return "Notification Settings";
      case "privacy":
        return "Privacy Settings";
      case "help":
        return "Help & Support";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="flex items-center mb-6 px-4 pt-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{getSectionTitle()}</h1>
      </div>

      <div className="px-4">
        {renderSettingsContent()}
      </div>
    </>
  );
};

export default ProfileSettings;
