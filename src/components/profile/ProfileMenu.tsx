
import { ReactNode } from "react";
import { 
  Bell, 
  Shield, 
  HelpCircle,
  ChevronRight,
  SettingsIcon 
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface MenuItem {
  icon: typeof SettingsIcon;
  label: string;
  onClick: () => void;
}

interface ProfileMenuProps {
  onNavigate: (section: string) => void;
}

const ProfileMenu = ({ onNavigate }: ProfileMenuProps) => {
  const menuItems: MenuItem[] = [
    {
      icon: SettingsIcon,
      label: "General Settings",
      onClick: () => onNavigate("general"),
    },
    {
      icon: Bell,
      label: "Notifications",
      onClick: () => onNavigate("notifications"),
    },
    {
      icon: Shield,
      label: "Privacy",
      onClick: () => onNavigate("privacy"),
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      onClick: () => onNavigate("help"),
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      {menuItems.map((item, index) => (
        <div key={item.label}>
          <button
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={item.onClick}
          >
            <div className="flex items-center">
              <item.icon className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>{item.label}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
          {index < menuItems.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
};

export default ProfileMenu;
