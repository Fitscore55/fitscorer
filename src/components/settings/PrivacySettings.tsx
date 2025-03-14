
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
      <div>
        <h2 className="text-xl font-semibold mb-2">Privacy Settings</h2>
        <p className="text-muted-foreground">
          Manage how your information is used and shared.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Sharing</CardTitle>
          <CardDescription>
            Control what information is visible to other users and third parties.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="share-activity">Share Activity</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see your workout activity
              </p>
            </div>
            <Switch 
              id="share-activity" 
              checked={settings.shareActivity}
              onCheckedChange={() => handleToggleChange("shareActivity")}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="share-location">Share Location</Label>
              <p className="text-sm text-muted-foreground">
                Share your location for better workout recommendations
              </p>
            </div>
            <Switch 
              id="share-location" 
              checked={settings.shareLocation}
              onCheckedChange={() => handleToggleChange("shareLocation")}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="friend-requests">Allow Friend Requests</Label>
              <p className="text-sm text-muted-foreground">
                Allow other users to send you friend requests
              </p>
            </div>
            <Switch 
              id="friend-requests" 
              checked={settings.allowFriendRequests}
              onCheckedChange={() => handleToggleChange("allowFriendRequests")}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>
            Manage your data and privacy preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="data-collection">Data Collection</Label>
              <p className="text-sm text-muted-foreground">
                Allow us to collect usage data to improve the app
              </p>
            </div>
            <Switch 
              id="data-collection" 
              checked={settings.dataCollection}
              onCheckedChange={() => handleToggleChange("dataCollection")}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketing">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new features and promotions
              </p>
            </div>
            <Switch 
              id="marketing" 
              checked={settings.marketingEmails}
              onCheckedChange={() => handleToggleChange("marketingEmails")}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Your Data</h3>
              <p className="text-sm text-muted-foreground">
                Manage your personal data
              </p>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button variant="outline" onClick={handleDataExport}>
                Export Data
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacySettings;
