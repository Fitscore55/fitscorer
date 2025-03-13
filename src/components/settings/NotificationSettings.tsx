
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MessageSquare, Award, Trophy, Activity } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const NotificationSettings = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    challenges: true,
    achievements: true,
    reminders: false,
    friendActivity: true,
    systemUpdates: true,
    emailDigest: true,
    marketingEmails: false,
    pushNotifications: true
  });

  const handleToggle = (name: string, checked: boolean) => {
    setNotifications({
      ...notifications,
      [name]: checked
    });
  };

  const handleSave = () => {
    // In a real app, save settings to the database
    console.log("Saving notification settings:", notifications);
    toast({
      title: "Notification Settings Saved",
      description: "Your notification preferences have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>App Notifications</CardTitle>
          <CardDescription>
            Manage your push notifications and in-app alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="h-5 w-5 text-fitscore-500" />
              <div>
                <h3 className="font-medium">Challenges</h3>
                <p className="text-sm text-muted-foreground">
                  Get notified about new challenges and results
                </p>
              </div>
            </div>
            <Switch 
              checked={notifications.challenges} 
              onCheckedChange={(checked) => handleToggle("challenges", checked)} 
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Award className="h-5 w-5 text-fitscore-500" />
              <div>
                <h3 className="font-medium">Achievements</h3>
                <p className="text-sm text-muted-foreground">
                  Notifications for badges and achievements
                </p>
              </div>
            </div>
            <Switch 
              checked={notifications.achievements} 
              onCheckedChange={(checked) => handleToggle("achievements", checked)} 
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-fitscore-500" />
              <div>
                <h3 className="font-medium">Daily Reminders</h3>
                <p className="text-sm text-muted-foreground">
                  Get reminders to complete your daily steps
                </p>
              </div>
            </div>
            <Switch 
              checked={notifications.reminders} 
              onCheckedChange={(checked) => handleToggle("reminders", checked)} 
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-fitscore-500" />
              <div>
                <h3 className="font-medium">Friend Activity</h3>
                <p className="text-sm text-muted-foreground">
                  See when friends complete challenges or earn badges
                </p>
              </div>
            </div>
            <Switch 
              checked={notifications.friendActivity} 
              onCheckedChange={(checked) => handleToggle("friendActivity", checked)} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Manage what emails you receive from FitScore
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-fitscore-500" />
              <div>
                <h3 className="font-medium">Weekly Digest</h3>
                <p className="text-sm text-muted-foreground">
                  Receive a weekly summary of your activity
                </p>
              </div>
            </div>
            <Switch 
              checked={notifications.emailDigest} 
              onCheckedChange={(checked) => handleToggle("emailDigest", checked)} 
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-5 w-5 text-fitscore-500" />
              <div>
                <h3 className="font-medium">Marketing Emails</h3>
                <p className="text-sm text-muted-foreground">
                  Receive updates on new features and promotions
                </p>
              </div>
            </div>
            <Switch 
              checked={notifications.marketingEmails} 
              onCheckedChange={(checked) => handleToggle("marketingEmails", checked)} 
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">Save Changes</Button>
    </div>
  );
};

export default NotificationSettings;
