
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, Monitor } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const GeneralSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    theme: "system",
    distanceUnit: "km",
    language: "english",
    appNotifications: true,
    emailNotifications: true,
    shareStats: true,
    darkMode: false
  });

  const handleChange = (name: string, value: any) => {
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handleSave = () => {
    // In a real app, save settings to the database
    console.log("Saving settings:", settings);
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant={settings.theme === "light" ? "default" : "outline"} 
              className="flex flex-col items-center justify-center h-20 p-2"
              onClick={() => handleChange("theme", "light")}
            >
              <Sun className="h-6 w-6 mb-2" />
              <span className="text-xs">Light</span>
            </Button>
            <Button 
              variant={settings.theme === "dark" ? "default" : "outline"} 
              className="flex flex-col items-center justify-center h-20 p-2"
              onClick={() => handleChange("theme", "dark")}
            >
              <Moon className="h-6 w-6 mb-2" />
              <span className="text-xs">Dark</span>
            </Button>
            <Button 
              variant={settings.theme === "system" ? "default" : "outline"} 
              className="flex flex-col items-center justify-center h-20 p-2"
              onClick={() => handleChange("theme", "system")}
            >
              <Monitor className="h-6 w-6 mb-2" />
              <span className="text-xs">System</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select 
              value={settings.language} 
              onValueChange={(value) => handleChange("language", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="distanceUnit">Distance Unit</Label>
            <Select 
              value={settings.distanceUnit} 
              onValueChange={(value) => handleChange("distanceUnit", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="km">Kilometers</SelectItem>
                <SelectItem value="miles">Miles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Dark Mode</h3>
              <p className="text-sm text-muted-foreground">
                Enable dark mode for the app
              </p>
            </div>
            <Switch 
              checked={settings.darkMode} 
              onCheckedChange={(checked) => handleChange("darkMode", checked)} 
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">Save Changes</Button>
    </div>
  );
};

export default GeneralSettings;
