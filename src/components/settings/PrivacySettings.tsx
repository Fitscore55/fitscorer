
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Shield, Download, Trash2, UserCheck, MapPin, Database, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const PrivacySettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [settings, setSettings] = useState({
    shareActivity: false,
    shareLocation: false,
    allowFriendRequests: true,
    dataCollection: true,
    marketingEmails: false,
  });

  const handleToggleChange = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    // Simulate saving to database
    toast({
      title: "Settings updated",
      description: "Your privacy settings have been saved.",
    });
  };
  
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    
    if (confirmed) {
      try {
        // In a real app, you would delete the user's data from Supabase
        toast({
          title: "Account deletion initiated",
          description: "Your account will be deleted within 24 hours.",
        });
      } catch (error) {
        console.error("Error deleting account:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was a problem deleting your account. Please try again.",
        });
      }
    }
  };
  
  const handleDataExport = async () => {
    if (!user) return;
    
    try {
      // In a real app, you would generate and provide a data export
      toast({
        title: "Data export requested",
        description: "Your data export is being prepared and will be emailed to you.",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem exporting your data. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Data Sharing</h3>
        </div>
        
        <Card className="p-4 space-y-4">
          <ToggleItem 
            id="share-activity"
            label="Share Activity"
            description="Allow others to see your workout activity"
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>}
            checked={settings.shareActivity}
            onChange={() => handleToggleChange("shareActivity")}
          />
          
          <Separator />
          
          <ToggleItem 
            id="share-location"
            label="Share Location"
            description="Share your location for better workout recommendations"
            icon={<MapPin className="h-5 w-5" />}
            checked={settings.shareLocation}
            onChange={() => handleToggleChange("shareLocation")}
          />
          
          <Separator />
          
          <ToggleItem 
            id="friend-requests"
            label="Allow Friend Requests"
            description="Allow other users to send you friend requests"
            icon={<UserCheck className="h-5 w-5" />}
            checked={settings.allowFriendRequests}
            onChange={() => handleToggleChange("allowFriendRequests")}
          />
        </Card>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Data & Privacy</h3>
        </div>
        
        <Card className="p-4 space-y-4">
          <ToggleItem 
            id="data-collection"
            label="Data Collection"
            description="Allow us to collect usage data to improve the app"
            icon={<Database className="h-5 w-5" />}
            checked={settings.dataCollection}
            onChange={() => handleToggleChange("dataCollection")}
          />
          
          <Separator />
          
          <ToggleItem 
            id="marketing"
            label="Marketing Emails"
            description="Receive emails about new features and promotions"
            icon={<Mail className="h-5 w-5" />}
            checked={settings.marketingEmails}
            onChange={() => handleToggleChange("marketingEmails")}
          />
        </Card>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Your Data</h3>
        </div>
        
        <Card className="p-4 space-y-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <Download className="h-5 w-5 text-muted-foreground" />
              <div>
                <h4 className="font-medium">Export Your Data</h4>
                <p className="text-sm text-muted-foreground">
                  Download a copy of all your personal data
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleDataExport} className="ml-8">
              Export Data
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <div>
                <h4 className="font-medium">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  This will permanently delete all your data
                </p>
              </div>
            </div>
            <Button variant="destructive" onClick={handleDeleteAccount} className="ml-8">
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

interface ToggleItemProps {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: () => void;
}

const ToggleItem = ({ id, label, description, icon, checked, onChange }: ToggleItemProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <Label htmlFor={id}>{label}</Label>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <Switch 
        id={id} 
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );
};

export default PrivacySettings;
